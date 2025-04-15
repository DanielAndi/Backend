const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  res.json({ data, error });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  res.json({ data, error });
});

module.exports = router;
