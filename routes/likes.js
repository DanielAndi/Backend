const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Like a blog or recipe
router.post('/', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });

    const { target_id, type } = req.body;

    if (!['blog', 'recipe'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be \"blog\" or \"recipe\".' });
    }

    // Verify if target exists before creating like
    const { data: targetExists, error: targetError } = await supabase
        .from(type + 's')  // 'recipes' or 'blogs'
        .select('id')
        .eq('id', target_id)
        .single();

    if (targetError || !targetExists) {
        return res.status(404).json({ error: `${type} not found` });
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', target_id)
        .eq('type', type)
        .single();

    if (existingLike) {
        return res.status(400).json({ error: `Already liked this ${type}` });
    }

    // Create the like
    const { data, error } = await supabase
        .from('likes')
        .insert([{ user_id: user.id, target_id, type }])
        .select('*')
        .single();

    if (error) return res.status(400).json({ error });
    res.status(201).json(data);
});

// Get posts liked by the authenticated user
router.get('/my-likes', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });

    const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id);

    if (error) return res.status(400).json({ error });
    res.json(data);
});

// Get all posts liked by a specific user
router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    
    // Get user's ID from profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Get all likes by this user with related recipe/blog information
    const { data, error } = await supabase
        .from('likes')
        .select(`
            id,
            type,
            target_id,
            user_id,
            profiles!likes_user_id_fkey(username),
            recipes:recipe_id(*),
            blogs:blog_id(*)
        `)
        .eq('user_id', profile.id);

    if (error) return res.status(400).json({ error });

    // Transform the response to include only relevant data
    const transformedData = data.map(like => {
        const target = like[like.type === 'recipe' ? 'recipes' : 'blogs'] || {};
        return {
            id: like.id,
            type: like.type,
            target_id: like.target_id,
            title: target.title || '',
            image_url: target.image_url || ''
        };
    });

    res.json(transformedData);
});

// Get all likes for a specific target (blog or recipe)
router.get('/:target_id', async (req, res) => {
    const { target_id } = req.params;
    const { type } = req.query;

    if (!['blog', 'recipe'].includes(type)) {
        return res.status(400).json({ error: 'Invalid or missing type. Use \"blog\" or \"recipe\".' });
    }

    const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('target_id', target_id)
        .eq('type', type);

    if (error) return res.status(400).json({ error });
    res.json(data);
});

// Unlike a blog or recipe
router.delete('/:target_id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError });

    const { target_id } = req.params;
    const { type } = req.query;

    if (!['blog', 'recipe'].includes(type)) {
        return res.status(400).json({ error: 'Invalid or missing type. Use \"blog\" or \"recipe\".' });
    }

    // Verify if like exists
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', target_id)
        .eq('type', type)
        .single();

    if (!existingLike) {
        return res.status(404).json({ error: `You haven't liked this ${type}` });
    }

    // Delete the like
    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', target_id)
        .eq('type', type);

    if (error) return res.status(400).json({ error }); // Make sure this return is here
    return res.status(200).json({ message: 'Successfully unliked' }); // Added return and proper status code
});
module.exports = router;

