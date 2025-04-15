const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all blogs
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('blogs').select('*');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create a blog
router.post('/', async (req, res) => {
  const { title, content, user_id } = req.body;
  const { data, error } = await supabase.from('blogs').insert([{ title, content, user_id }]);
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

// Get blogs by authenticated user
router.get('/my-blogs', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError });

  const { data, error } = await supabase.from('blogs').select('*').eq('user_id', user.id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Delete a blog (auth-required)
router.delete('/my-blogs/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError });

  const user_id = userData.user.id;
  const { id } = req.params;

  const { data: blog } = await supabase.from('blogs').select('user_id').eq('id', id).single();
  if (!blog || blog.user_id !== user_id) {
    return res.status(403).json({ error: 'Not authorized to delete this blog' });
  }

  const { error } = await supabase.from('blogs').delete().eq('id', id).eq('user_id', user_id);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
// This code defines an Express router for handling blog-related routes in a Node.js application. It uses Supabase as the backend database and authentication service. The router includes endpoints for getting all blogs, creating a new blog, retrieving blogs by the authenticated user, and deleting a blog. Each endpoint handles errors appropriately and returns JSON responses.