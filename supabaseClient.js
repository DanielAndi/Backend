// Load environment variables from a .env file into process.env.
// This allows secure access to sensitive information like API keys and URLs.
require('dotenv').config();

// Import the createClient function from the @supabase/supabase-js library.
// This function is used to initialize a connection to a Supabase project.
const { createClient } = require('@supabase/supabase-js');


// Create a Supabase client instance using the URL and API key from environment variables.
// process.env.SUPABASE_URL: The URL of your Supabase project.
// process.env.SUPABASE_KEY: The API key for accessing your Supabase project.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Export the Supabase client instance for use in other parts of the application.
module.exports = supabase;

