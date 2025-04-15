const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  res.json({ data, error });
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

//See all users
router.get("/users", async (req, res) => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(400).json({ error });
    res.json(data.users);
  });
  

module.exports = router;
