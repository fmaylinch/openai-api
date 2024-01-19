// index.js
const express = require('express')
const app = express()
app.use(express.json()) // parse json bodies
const PORT = 4000
const OpenAI = require('openai')

app.get('/', async (req, res) => {
    res.status(200).json('App is running');
})

app.post('/chat', async (req, res) => {
    console.log("request body", req.body);

    let openai = new OpenAI({
        apiKey: req.body.apiKey
    });

    let messages = req.body.messages;

    const response = await openai.chat.completions.create({
        model: req.body.model || "gpt-4",
        messages
    });

    res.status(200).json(response);
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app
