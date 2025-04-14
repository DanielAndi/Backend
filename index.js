// Import the Express library, which is used to create a web server.
const express = require('express');

// Create an instance of an Express application.
const app = express();

// Import the Supabase client instance from the supabaseClient.js file.
// This will be used to interact with the Supabase database.
const supabase = require('./supabaseClient');

// Use the Express JSON middleware to parse incoming JSON request bodies.
// This allows the server to handle JSON data sent in requests.
app.use(express.json());

// Define a GET endpoint at the '/recipes' route.
// This endpoint retrieves all recipes from the 'recipes' table in the Supabase database.
app.get('/recipes', async (req, res) => {
  // Query the 'recipes' table in the Supabase database to select all rows.
  const { data, error } = await supabase.from('recipes').select('*');

  // If there is an error during the query, send a 400 status code with the error message.
  if (error) return res.status(400).json({ error });

  // If the query is successful, send the retrieved data as a JSON response.
  res.json(data);
});

// Start the server and listen on port 3000.
// Log a message to the console indicating that the server is running.
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});