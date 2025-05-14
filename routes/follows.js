const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 🔐 Helper: get authenticated user
async function getUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

// ➕ POST /follows/:username — Follow a user
router.post('/:username', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username } = req.params;

  // Get the ID of the user to follow
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!targetProfile) return res.status(404).json({ error: 'User not found' });

  if (targetProfile.id === user.id) {
    return res.status(400).json({ error: "You can't follow yourself" });
  }

  // Insert follow
  const { error } = await supabase.from('follows').insert([
    { follower_id: user.id, following_id: targetProfile.id }
  ]);

  if (error) return res.status(400).json({ error });
  res.json({ message: `You are now following ${username}` });
});

// ❌ DELETE /follows/:username — Unfollow a user
router.delete('/:username', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username } = req.params;

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!targetProfile) return res.status(404).json({ error: 'User not found' });

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetProfile.id);

  if (error) return res.status(400).json({ error });
  res.json({ message: `You unfollowed ${username}` });
});

// 👥 GET /follows/followers/:username — Get a user's followers
router.get('/followers/:username', async (req, res) => {
  const { username } = req.params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follower_id (username, avatar_url)')
    .eq('following_id', profile.id);

  if (error) return res.status(400).json({ error });
  res.json(data.map(f => f.profiles));
});

// ➡️ GET /follows/following/:username — Get users they are following
router.get('/following/:username', async (req, res) => {
  const { username } = req.params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!following_id (username, avatar_url)')
    .eq('follower_id', profile.id);

  if (error) return res.status(400).json({ error });
  res.json(data.map(f => f.profiles));
});

module.exports = router;
