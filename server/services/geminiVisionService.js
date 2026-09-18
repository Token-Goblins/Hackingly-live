// Google Gemini Multimodal Vision & Intelligence Service
const { GoogleGenAI } = require('@google/genai');

class GeminiVisionService {
  constructor() {
    this.ai = null;
    this.isConfigured = false;
    this.modelName = 'gemini-2.5-flash';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.initClient(apiKey);
    }
  }

  initClient(apiKey) {
    try {
      this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      this.isConfigured = true;
      return { success: true, message: 'Google Gemini Vision AI initialized' };
    } catch (err) {
      this.isConfigured = false;
      return { success: false, error: err.message };
    }
  }

  getStatus() {
    return {
      provider: 'Google Gemini AI',
      model: this.modelName,
      isConfigured: this.isConfigured,
      capabilities: [
        'Multimodal Document Understanding',
        'Physical & Digital Tamper Anomaly Detection',
        'Biometric Cross-Check (ID Photo vs Live Selfie)',
        'Institution & Accreditation Verification'
      ],
      mode: this.isConfigured ? 'GEMINI_CLOUD_LIVE' : 'LOCAL_FORENSIC_VISION_ENGINE'
    };
  }

  /**
   * Performs multimodal analysis on document image + live selfie
   */
  async analyzeWithGemini({ documentBase64, selfieBase64, applicantName, eventDetails }) {
    if (!this.isConfigured || !this.ai || !documentBase64) {
      return {
        usedGemini: false,
        note: 'Using high-speed local forensic & biometric engine'
      };
    }

    try {
      const prompt = `You are a forensic identity document expert for Hackingly hackathons.
Evaluate this Indian identity document and selfie for the applicant "${applicantName}".
Check:
1. Is the document genuine or digitally altered (check for mismatched fonts, edited DOB, clone patches)?
2. Does the photo on the ID match the selfie of the person registering?
3. Extract Name, DOB (DD-MM-YYYY), ID Number, and Institution.
Return JSON with:
{
  "isTampered": boolean,
  "tamperConfidence": number (0-100),
  "tamperReason": string,
  "faceMatch": boolean,
  "faceMatchScore": number (0-100),
  "extractedFields": { "name": string, "dob": string, "idNumber": string, "institution": string }
}`;

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: documentBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        }
      ];

      if (selfieBase64) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: selfieBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        });
      }

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          usedGemini: true,
          geminiVerdict: parsed
        };
      }

      return {
        usedGemini: true,
        rawText: responseText
      };
    } catch (err) {
      console.warn('[Gemini AI] Call failed, fallback to local engine:', err.message);
      return {
        usedGemini: false,
        error: err.message
      };
    }
  }
}

const geminiVisionService = new GeminiVisionService();
module.exports = geminiVisionService;
