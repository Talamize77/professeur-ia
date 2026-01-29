const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// TA NOUVELLE CLÉ ICI
const MUNSIT_API_KEY = "sk-ctxt-100fa312645b4bcb9c08e04af2d61601"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        console.log("Analyse demandée pour : " + targetPhrase);

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'munsit-1');
        form.append('language', 'ar'); // ON FORCE L'ARABE

        const response = await axios.post("https://api.cntxt.tools/audio/transcribe", form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text || "";
        console.log("Texte capté par Munsit : [" + transcription + "]");

        // On nettoie le texte pour éviter les erreurs d'espaces
        const cleanTranscription = transcription.trim();

        if (cleanTranscription.includes(targetPhrase)) {
            console.log("✅ MATCH !");
            res.json({ status: "SUCCESS" });
        } else {
            console.log("❌ NO MATCH. Reçu : " + cleanTranscription);
            res.json({ status: "ERROR", received: cleanTranscription });
        }
    } catch (error) {
        console.error("Détails de l'erreur :", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

app.listen(8080, () => console.log("Serveur Professeur IA prêt sur port 8080"));
