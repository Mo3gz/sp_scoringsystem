const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const cors = require('cors'); // CORS support for development
const app = express();
const port = process.env.PORT || 3000;

// Team names mapping
const teamNames = {
  1: 'Team 1',
  2: 'Team 2',
  3: 'Team 3',
  4: 'Team 4',
  5: 'Team 5',
  6: 'Team 6'
};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// MongoDB Atlas connection URI
const uri = "mongodb+srv://sigmanup:JkR8fuT3Gc5l49OS@scoringsystem.3xihn42.mongodb.net/?retryWrites=true&w=majority&appName=Scoringsystem";
const DATABASE_NAME = 'scoreboard';
const COLLECTION_NAME = 'scores';

// Create a MongoClient with MongoClientOptions to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db, collection;

// Connect to MongoDB and initialize database
async function connectToDatabase() {
  try {
    // Connect the client to MongoDB Atlas
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    // Access the database and collection
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);

    // Initialize the database with default scores if empty
    await initDatabase();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Function to initialize the database with default data
async function initDatabase() {
  try {
    const count = await collection.countDocuments();
    if (count === 0) {
      const teamData = Array.from({ length: 6 }, (_, i) => ({
        teamNumber: i + 1,
        score: 0
      }));
      await collection.insertMany(teamData);
      console.log('Inserted initial data into MongoDB');
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

// GET route to fetch all scores
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await collection.find({}).toArray();
    const scoresArr = scores.map((row) => ({
      teamNumber: row.teamNumber,
      teamName: teamNames[row.teamNumber] || `Team ${row.teamNumber}`,
      score: row.score
    }));
    res.json(scoresArr);
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ message: 'Error fetching scores' });
  }
});

// PUT route to update score for a specific team
app.put('/api/scores/:teamNumber', async (req, res) => {
  const teamNumber = parseInt(req.params.teamNumber);
  const newScore = req.body.score;

  if (isNaN(newScore) || teamNumber < 1 || teamNumber > 6) {
    return res.status(400).json({ message: 'Invalid team number or score.' });
  }

  try {
    const result = await collection.updateOne(
      { teamNumber },
      { $set: { score: newScore } },
      { upsert: true }
    );

    if (result.acknowledged) {
      res.json({ message: 'Score updated successfully!' });
    } else {
      res.status(500).json({ message: 'Error updating score.' });
    }
  } catch (err) {
    console.error('Error updating score:', err);
    res.status(500).json({ message: 'Error updating score.' });
  }
});

// Serve static files (public directory) for frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server and connect to MongoDB
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  await connectToDatabase();
});
