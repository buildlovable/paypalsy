
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.0.0";

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Stripe function called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      console.error("No authorization header");
      throw new Error("No authorization header");
    }

    // Create Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authorization } } }
    );
    
    // Get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error("Error getting user");
    }

    if (!user) {
      console.error("No user found in session");
      throw new Error("Authentication required");
    }

    console.log("User authenticated:", user.id);
    const userId = user.id;
    
    // Parse request body
    const requestData = await req.json();
    const { action, ...data } = requestData;
    
    console.log("Action requested:", action);

    // Handle different actions
    if (action === "create-setup-intent") {
      // Check if user already has a Stripe customer
      const { data: customerData, error: customerError } = await supabaseClient
        .from("stripe_customers")
        .select("customer_id")
        .eq("id", userId)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        console.error("Error fetching customer:", customerError);
      }

      let customerId;

      if (customerData?.customer_id) {
        console.log("Found existing customer:", customerData.customer_id);
        customerId = customerData.customer_id;
      } else {
        // Create a new Stripe customer
        console.log("Creating new customer for user:", userId);
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        
        customerId = customer.id;
        
        // Save customer ID in database
        const { error: insertError } = await supabaseClient
          .from("stripe_customers")
          .insert({ id: userId, customer_id: customerId });
          
        if (insertError) {
          console.error("Error saving customer:", insertError);
        }
      }

      // Create a SetupIntent
      console.log("Creating setup intent for customer:", customerId);
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });

      return new Response(
        JSON.stringify({ clientSecret: setupIntent.client_secret }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (action === "get-payment-methods") {
      // Get customer ID
      const { data: customerData } = await supabaseClient
        .from("stripe_customers")
        .select("customer_id")
        .eq("id", userId)
        .single();

      if (!customerData?.customer_id) {
        return new Response(
          JSON.stringify({ paymentMethods: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerData.customer_id,
        type: "card",
      });

      return new Response(
        JSON.stringify({ paymentMethods: paymentMethods.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === "save-payment-method") {
      const { paymentMethodId } = data;
      
      // Get customer ID
      const { data: customerData } = await supabaseClient
        .from("stripe_customers")
        .select("customer_id")
        .eq("id", userId)
        .single();
        
      if (!customerData?.customer_id) {
        throw new Error("No customer found");
      }

      // Get payment method details from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (!paymentMethod.card) {
        throw new Error("Invalid payment method");
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerData.customer_id,
      });

      // Save payment method in database
      await supabaseClient
        .from("payment_methods")
        .insert({
          user_id: userId,
          stripe_payment_method_id: paymentMethodId,
          card_brand: paymentMethod.card.brand,
          last_four: paymentMethod.card.last4,
          expires_at: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
          stripe_customer_id: customerData.customer_id,
          is_default: false,
        });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === "set-default-payment-method") {
      const { paymentMethodId } = data;
      
      // Set as default in database
      const { error } = await supabaseClient.rpc("update_default_payment_method", { 
        user_id_param: userId,
        payment_method_id_param: paymentMethodId
      });

      if (error) {
        throw new Error(`Error setting default payment method: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === "delete-payment-method") {
      const { paymentMethodId } = data;
      
      // Remove from database
      await supabaseClient
        .from("payment_methods")
        .delete()
        .eq("stripe_payment_method_id", paymentMethodId)
        .eq("user_id", userId);
      
      // Detach from Stripe
      await stripe.paymentMethods.detach(paymentMethodId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    throw new Error("Invalid action");
  } catch (error) {
    console.error("Stripe payment method error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
