const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { OpenAIApi, Configuration } = require('openai');
require('dotenv').config();

admin.initializeApp();

const app = express();
const routes = require("./routes");
app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);

const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).send('Unauthorized');
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send('Unauthorized');
  }
};

app.post('/contact-form', async (req, res) => {
  const { email, message } = req.body;
  // Store submission in Firestore
  await admin.firestore().collection('submissions').add({ email, message, created: new Date() });
  res.json({ ok: true });
});

app.post('/ask', verifyFirebaseToken, async (req, res) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const { prompt } = req.body;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  await admin.firestore().collection('prompts').add({ prompt, created: new Date() });
  res.json({ reply: completion.data.choices[0].message.content });
});

module.exports = app;
