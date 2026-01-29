const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const MUNSIT_API_KEY = "sk-ctxt-100fa312645b4bcb9c08e04af2d61601"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id.trim(); 
        console.log("Cible attendue : " + targetPhrase);

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname || 'audio.webm',
            contentType: req.file.mimetype || 'audio/webm',
        });
        form.append('model', 'munsit-1');
        form.append('language', 'ar'); 

        const response = await axios.post("https://api.cntxt.tools/audio/transcribe", form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = (response.data.text || (response.data.data && response.data.data.transcription) || "").trim();
        console.log("Munsit a entendu (BRUT) : [" + transcription + "]");

        if (!transcription) {
            return res.json({ status: "ERROR", message: "EMPTY_AUDIO" });
        }

        // NETTOYAGE LÉGER : On enlève juste la ponctuation
        const cleanTranscription = transcription.replace(/[.,!?;]/g, "");

        // LOGIQUE SOUPLE MAIS PRÉCISE : 
        // On vérifie si le mot cible est contenu dans la réponse de l'élève
        if (cleanTranscription.includes(targetPhrase)) {
            console.log("✅ Match réussi (mot trouvé dans la phrase) !");
            res.json({ status: "SUCCESS" });
        } else {
            console.log("❌ Écart détecté. Reçu : " + cleanTranscription);
            res.json({ status: "ERROR", received: cleanTranscription });
        }
    } catch (error) {
        console.error("Erreur API :", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});
