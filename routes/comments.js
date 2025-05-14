const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Add comment to a blog or recipe
router.post('/', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
  
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });
  
    const { comment, target_id, type } = req.body;
  
    // ✅ Validate type
    if (!['blog', 'recipe'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be \"blog\" or \"recipe\".' });
    }
  
    const { data, error } = await supabase
      .from('comments')
      .insert([{ comment, user_id: user.id, target_id, type }])
      .select('*')
      .single();
  
    if (error) return res.status(400).json({ error });
    res.status(201).json(data);
  });
  

// Get all comments for a specific target (blog or recipe)
router.get('/:target_id', async (req, res) => {
    const { target_id } = req.params;
    const { type } = req.query;
  
    const query = supabase.from('comments').select('*').eq('target_id', target_id);
    if (type) query.eq('type', type);
  
    const { data, error } = await query;
    if (error) return res.status(400).json({ error });
    res.json(data);
  });
  

// Delete a comment by ID
router.delete('/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });

    const { id } = req.params;

    // Check if the comment belongs to the user
    const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', id)
        .single();
        // Check if the comment exists and belongs to the user
    if (fetchError || comment.user_id !== user.id) {
        return res.status(403).json({ error: 'Unauthorized or comment not found' });
    }

    const { error } = await supabase
        .from('comments') 
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ error });
    res.status(204).send();
});

// Update a comment by ID
router.put('/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });

    const { id } = req.params;
    const { comment } = req.body;

    // Check if the comment belongs to the user
    const { data: existingComment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (fetchError || existingComment.user_id !== user.id) {
        return res.status(403).json({ error: 'Unauthorized or comment not found' });
    }

    const { data, error } = await supabase
        .from('comments')
        .update({ comment })
        .eq('id', id)
        .select('*')
        .single();

    if (error) return res.status(400).json({ error });
    res.json(data);
});

module.exports = router;