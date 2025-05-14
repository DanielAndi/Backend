const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper: get user from access token
async function getUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

// GET /profiles/:username — Get a public profile by username
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url, created_at')
    .eq('username', username)
    .single();

  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json(data);
});

// GET /profiles/:username/recipes
router.get('/:username/recipes', async (req, res) => {
  const { username } = req.params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', profile.id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET /profiles/:username/blogs
router.get('/:username/blogs', async (req, res) => {
  const { username } = req.params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('user_id', profile.id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// POST /profiles — Create your profile (after register)
router.post('/', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username, bio, avatar_url } = req.body;

  const { error } = await supabase.from('profiles').insert([
    {
      id: user.id,
      username,
      bio,
      avatar_url,
    }
  ]);

  if (error) return res.status(400).json({ error });
  res.status(201).json({ message: 'Profile created' });
});

// PUT /profiles — Update your own profile
router.put('/', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username, bio, avatar_url } = req.body;

  const { error } = await supabase
    .from('profiles')
    .update({ username, bio, avatar_url })
    .eq('id', user.id);

  if (error) return res.status(400).json({ error });
  res.json({ message: 'Profile updated' });
});

module.exports = router;
