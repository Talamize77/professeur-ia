const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

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
                // On essaie le format EXACT de leur doc Python/JS
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        // Munsit renvoie le texte dans response.data.text
        const transcription = response.data.text || "";
        console.log("Munsit a compris :", transcription);

        // Nettoyage pour comparer (on enlève les espaces en trop)
        if (transcription.trim().toLowerCase().includes(targetPhrase.trim().toLowerCase())) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        // On affiche l'erreur complète pour comprendre pourquoi Munsit bloque
        console.error("Erreur Munsit :", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur prêt sur port ${PORT}`));
