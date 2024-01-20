// index.js
const express = require('express')
const app = express()
app.use(express.json()) // parse json bodies
const PORT = 4000
const OpenAI = require('openai')

app.get('/', async (req, res) => {
    res.status(200).json('App is running');
})

// chat.completions.create
app.post('/chat', async (req, res) => {

    const auth = req.header("Authorization");
    let apiKey = auth.split(" ")[1];

    let openai = new OpenAI({ apiKey: apiKey });

    let chatPayload = {
        model: req.body.model || "gpt-4",
        messages: req.body.messages
    };

    const response = await openai.chat.completions.create(chatPayload);

    res.status(200).json(response);
})

// generic call
app.post('/call', async (req, res) => {

    const auth = req.header("Authorization");
    const apiKey = auth.split(" ")[1];

    const openai = new OpenAI({ apiKey: apiKey });

    let method = openai;
    for (let segment of req.body.methodPath) { // e.g. ["chat", "completions", "create"]
        method = method[segment];
        if (!method) {
            res.status(400).json({
                error: `unknown segment ${segment} in path ${req.body.methodPath}`
            });
            return;
        }
    }

    if (req.body.debug) {
        res.status(200).json({
            info: `would call ${req.body.methodPath.join('.')} with payload: ${JSON.stringify(req.body.payload)}`
        });
        return;
    }

    const response = await method(req.body.payload);

    res.status(200).json(response);
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app
