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

    const response = await openai.chat.completions.create(req.body);

    res.status(200).json(response);
})

// generic call
app.post('/call', async (req, res) => {

    const auth = req.header("Authorization");
    const apiKey = auth.split(" ")[1]; // auth should be "Bearer xxx"

    const openai = new OpenAI({ apiKey: apiKey });

    // Custom headers to select the call
    const methodPath = req.header("OpenAI-Bridge-MethodPath"); // e.g. "chat.completions.create"
    const debugMode = req.header("OpenAI-Bridge-DebugMode");

    let method;
    try {
        method = getMethod(openai, methodPath);
    } catch (error) {
        return res.status(400).json({ error });
    }

    console.log(`debugMode: '${debugMode}'`);
    if (debugMode === "true") {
        return res.status(200).json({
            info: `would call ${methodPath} with payload: ${JSON.stringify(req.body)}`
        });
    }

    try {
        const response = await method(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.log("Error from OpenAI API:", error);
        return res.status(406).json({ error });
    }
})

function getMethod(object, methodPath) {
    const methodPathArray = methodPath.split(".");
    let parentObject;
    for (let segment of methodPathArray) {
        parentObject = object;
        object = object[segment];
        if (!object) {
            throw `unknown segment '${segment}' in path: ${methodPath}`;
        }
    }
    // bind method, so it can be called standalone
    return object.bind(parentObject);
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app
