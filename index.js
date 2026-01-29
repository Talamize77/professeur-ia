const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const MUNSIT_API_KEY = process.env.MUNSIT_API_KEY; 
const MUNSIT_URL = "https://api.cntxt.tools/v1/stt"; 

app.post('/analyser', upload.single('file'), async (req, res) => {
    try {
        const targetPhrase = req.body.phrase_id; 
        
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        form.append('model', 'arabic-general');

        const response = await axios.post(MUNSIT_URL, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text ? response.data.text.trim() : "";
        console.log(`Entendu: ${transcription} | Attendu: ${targetPhrase}`);

        // Comparaison simple pour commencer
        if (transcription.includes(targetPhrase) || targetPhrase.includes(transcription)) {
            res.json({ status: "SUCCESS", text: transcription });
        } else {
            res.json({ status: "ERROR", text: transcription });
        }
    } catch (error) {
        console.error("Erreur API Munsit:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
