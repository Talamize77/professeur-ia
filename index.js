const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// Clé directement dans le code pour éviter toute erreur de variable Railway
const MUNSIT_API_KEY = "sk-ctxt-100fa312645b4bcb9c08e04af2d61601"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'munsit-1');

        const response = await axios.post("https://api.cntxt.tools/audio/transcribe", form, {
            headers: {
                ...form.getHeaders(),
                // On utilise uniquement Authorization comme dans leur doc officielle
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text || "";
        console.log("Transcription réussie : " + transcription);

        if (transcription.toLowerCase().includes(targetPhrase.toLowerCase())) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        // Affiche l'erreur exacte pour qu'on sache si c'est la clé ou autre chose
        console.error("Erreur API Munsit :", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(error.response ? error.response.status : 500).json({ status: "SERVER_ERROR" });
    }
});

app.listen(8080, () => console.log("Serveur actif sur port 8080"));
