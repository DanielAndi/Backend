const express = require("express");
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = require("../supabaseClient");

// Register and create profile
router.post("/register", async (req, res) => {
    const { email, password, username, bio, avatar_url } = req.body;
  
    // Step 1: Register user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (authError) {
      return res.status(400).json({ error: authError });
    }
  
    const user = authData.user;
    const token = authData.session?.access_token;
  
    // ✅ Create a Supabase client with the new user's token
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  
    // Step 2: Insert profile using authenticated user context
    const { error: profileError } = await userClient.from("profiles").insert([
      {
        id: user.id,
        username,
        bio,
        avatar_url,
      },
    ]);
  
    if (profileError) {
      return res.status(400).json({ error: profileError });
    }
  
    res.status(201).json({
      message: "User and profile created successfully",
      user: {
        id: user.id,
        email: user.email,
        username,
      },
    });
  });

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  res.json({ data, error });
});

module.exports = router;
