const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all recipes
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('recipes').select('*');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create a recipe
router.post('/', async (req, res) => {
  const { title, content, user_id } = req.body;
  const { data, error } = await supabase.from('recipes').insert([{ title, content, user_id }]);
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

// Get recipes by authenticated user
router.get('/my-recipes', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError });

  const { data, error } = await supabase.from('recipes').select('*').eq('user_id', user.id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Delete a recipe (auth-required)
router.delete('/my-recipes/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError });

  const user_id = userData.user.id;
  const { id } = req.params;

  const { data: recipe } = await supabase.from('recipes').select('user_id').eq('id', id).single();
  if (!recipe || recipe.user_id !== user_id) {
    return res.status(403).json({ error: 'Not authorized to delete this recipe' });
  }

  const { error } = await supabase.from('recipes').delete().eq('id', id).eq('user_id', user_id);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Recipe deleted' });
});

module.exports = router;
