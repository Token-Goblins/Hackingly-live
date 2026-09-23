// AWS Textract Drop-In Adapter & Pipeline Middleware
// Bridges legacy AWS Textract OCR output into the AI Trust & Verification Engine

const { parseDocument } = require('./documentParser');
const { analyzeDocumentForensics } = require('./forensicEngine');
const { verifyFaceMatch } = require('./faceMatcher');
const dedupService = require('./dedupService');
const { evaluateEligibility, DEFAULT_EVENT_CONFIG } = require('./eligibilityEngine');

/**
 * Converts standard AWS Textract Blocks into flat text and line objects
 * @param {Object} textractOutput - Raw AWS Textract response ({ Blocks: [...] })
 */
function extractFromTextractBlocks(textractOutput) {
  if (!textractOutput || !Array.isArray(textractOutput.Blocks)) {
    return {
      text: '',
      lines: [],
      words: [],
      averageConfidence: 0
    };
  }

  const lines = [];
  const words = [];
  let totalConfidence = 0;
  let count = 0;

  for (const block of textractOutput.Blocks) {
    if (block.BlockType === 'LINE') {
      lines.push({
        text: block.Text,
        confidence: block.Confidence,
        geometry: block.Geometry
      });
      totalConfidence += block.Confidence || 0;
      count++;
    } else if (block.BlockType === 'WORD') {
      words.push({
        text: block.Text,
        confidence: block.Confidence,
        geometry: block.Geometry
      });
    }
  }

  const fullText = lines.map(l => l.text).join('\n');
  const avgConfidence = count > 0 ? Math.round(totalConfidence / count) : 0;

  return {
    text: fullText,
    lines,
    words,
    averageConfidence: avgConfidence
  };
}

/**
 * Generates an authentic AWS Textract Blocks JSON structure for simulation/testing
 */
function createMockTextractBlocks(textLines) {
  const blocks = [
    {
      BlockType: 'PAGE',
      Id: 'page-1',
      Geometry: { BoundingBox: { Width: 1, Height: 1, Left: 0, Top: 0 } }
    }
  ];

  textLines.forEach((line, idx) => {
    blocks.push({
      BlockType: 'LINE',
      Id: `line-${idx + 1}`,
      Text: line,
      Confidence: 98.4 - (idx % 3),
      Geometry: {
        BoundingBox: {
          Width: 0.8,
          Height: 0.05,
          Left: 0.1,
          Top: 0.1 + (idx * 0.08)
        }
      }
    });

    const wordList = line.split(/\s+/);
    wordList.forEach((word, wIdx) => {
      blocks.push({
        BlockType: 'WORD',
        Id: `word-${idx + 1}-${wIdx + 1}`,
        Text: word,
        Confidence: 99.1,
        Geometry: {
          BoundingBox: {
            Width: 0.1,
            Height: 0.04,
            Left: 0.1 + (wIdx * 0.12),
            Top: 0.1 + (idx * 0.08)
          }
        }
      });
    });
  });

  return {
    DocumentMetadata: { Pages: 1 },
    Blocks: blocks
  };
}

/**
 * Main drop-in adapter pipeline
 * Takes fintrust.ai's current Textract payload + registration details -> produces enriched verdict
 */
function processTextractVerification({
  textractBlocks,
  applicant = {},
  selfieImage = null,
  documentImage = null,
  simulatedAnomaly = null,
  eventConfig = DEFAULT_EVENT_CONFIG
}) {
  // 1. Extract plain text and metadata from Textract Blocks
  const ocrData = extractFromTextractBlocks(textractBlocks);

  // 2. Multi-document parser (Aadhaar, PAN, College ID, etc.)
  const parsedDoc = parseDocument(ocrData.text);

  // 3. Deep forensic tamper & quality analysis
  const forensicResults = analyzeDocumentForensics({
    ocrData,
    docType: parsedDoc.documentType,
    parsedFields: parsedDoc.fields,
    simulatedAnomaly
  });

  // 4. Biometric face verification
  const faceMatchResults = verifyFaceMatch({
    idPhoto: documentImage,
    selfie: selfieImage,
    simulatedAnomaly
  });

  // 5. Cross-registration Deduplication & Sybil check
  const dedupResults = dedupService.checkDuplicate({
    idNumber: parsedDoc.fields.idNumber,
    applicantName: applicant.name,
    imageStr: documentImage
  });

  // 6. Comprehensive Eligibility Evaluation
  const eligibilityVerdict = evaluateEligibility({
    applicant,
    parsedDoc,
    forensicResults,
    faceMatchResults,
    dedupResults,
    eventConfig
  });

  // 7. Backward-compatible payload for fintrust.ai's existing system
  // (Provides legacy fields like 'extractedDOB' and 'isAgeValid' alongside enhanced security)
  return {
    success: true,
    legacyCompat: {
      extractedDOB: parsedDoc.fields.dob,
      extractedAge: eligibilityVerdict.calculatedAge,
      isAgeEligible: !eligibilityVerdict.flags.some(f => f.type === 'AGE_INELIGIBLE')
    },
    enrichedVerification: {
      status: eligibilityVerdict.status,
      statusBadge: eligibilityVerdict.statusBadge,
      trustScore: eligibilityVerdict.trustScore,
      humanReadableReason: eligibilityVerdict.humanReadableSummary,
      scoreBreakdown: eligibilityVerdict.breakdown,
      flags: eligibilityVerdict.flags,
      documentType: parsedDoc.documentType,
      parsedFields: parsedDoc.fields,
      validationNotes: parsedDoc.validation.notes,
      forensics: {
        tamperRiskLevel: forensicResults.tamperRiskLevel,
        isTampered: forensicResults.isTampered,
        authenticityScore: forensicResults.authenticityScore,
        qualityScore: forensicResults.qualityScore,
        anomalies: forensicResults.anomalies,
        forensicHeatmap: forensicResults.forensicHeatmap
      },
      biometrics: {
        faceMatchStatus: faceMatchResults.status,
        similarityScore: faceMatchResults.similarityScore,
        reason: faceMatchResults.reason
      },
      deduplication: {
        isDuplicate: dedupResults.isDuplicate,
        isSybilAttack: dedupResults.isSybilAttack,
        existingRecord: dedupResults.existingRecord
      }
    }
  };
}

module.exports = {
  extractFromTextractBlocks,
  createMockTextractBlocks,
  processTextractVerification
};
