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
                'Authorization': `Bearer ${MUNSIT_API_KEY}`
            }
        });

        const transcription = response.data.text || "";
        console.log(`Reçu de Munsit: ${transcription}`);

        if (transcription.includes(targetPhrase)) {
            res.json({ status: "SUCCESS" });
        } else {
            res.json({ status: "ERROR", received: transcription });
        }
    } catch (error) {
        console.error("Erreur API Munsit:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "SERVER_ERROR" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
