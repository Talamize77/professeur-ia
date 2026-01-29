const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// Ta clé est déjà intégrée ici comme sur ta capture GitHub
const MUNSIT_API_KEY = "sk-ctxt-3c38eda7a2e54cf2802a7b002e9a7602"; 
const MUNSIT_URL = "https://api.cntxt.tools/audio/transcribe"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'munsit-1');

        const response = await axios.post(MUNSIT_URL, form, {
            headers: {
                ...form.getHeaders(),
                // On envoie la clé de deux façons pour être sûr
                'x-api-key': MUNSIT_API_KEY,
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text || "";
        console.log("Texte reçu : " + transcription);

        if (transcription.toLowerCase().includes(targetPhrase.toLowerCase())) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        // Cela nous affichera l'erreur exacte dans Railway
        console.error("Erreur Munsit :", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Serveur actif sur port 8080"));
