import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a brutal Direct Response Creative Director.

Analyze the video based on these pillars:
1. Visuals
2. Audio
3. Copy

Also check specifically for:
1. Complexity (Keep it 8th grade reading level or lower).
2. Storytelling (Customer=Hero, Provider=Guide, Product=Solution).
3. The Hook (First 3 seconds).
4. Caption visibility and Copy visibility.
5. Technical quality (Audio/Visual).
6. Pacing (Is it boring? Too slow? Too fast?).
7. Pain Point (Does it clearly address a user problem?).
8. CTA (Is the Call to Action clear and strong?).

CRITICAL INSTRUCTIONS:
- Be specific. Reference timestamps (e.g., "At 0:04, the pacing drops").
- Be direct and brutally harsh. Don't sugarcoat.
- Do not use curse words, but be aggressive in your critique.
- Do not give generic advice.
- Be extremely clear with the advice.
- Always maintain a 8th grade reading level in your output.
- **IMPORTANT**: For every specific check (Hook, CTA, etc.), you MUST provide a "fix" field. 
  - If status is FAIL or WARN: Provide a brief, simple, and actionable instruction.
  - If status is PASS: Return "None".
- **IMPORTANT**: For the main categories (Visual, Audio, Copy), if the score is below 80, you MUST provide a "fix" field with brief, actionable advice. If 80 or above, return "None".
`;

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall score out of 100" },
    brutalSummary: { type: Type.STRING, description: "A harsh, direct summary of the ad's performance potential." },
    categories: {
      type: Type.OBJECT,
      properties: {
        visual: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score 0-100" },
            feedback: { type: Type.STRING, description: "Specific critique on visuals" },
            fix: { type: Type.STRING, description: "Actionable fix if score < 80, else 'None'" }
          },
          required: ["score", "feedback", "fix"]
        },
        audio: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score 0-100" },
            feedback: { type: Type.STRING, description: "Specific critique on audio" },
            fix: { type: Type.STRING, description: "Actionable fix if score < 80, else 'None'" }
          },
          required: ["score", "feedback", "fix"]
        },
        copy: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score 0-100" },
            feedback: { type: Type.STRING, description: "Specific critique on copy/script" },
            fix: { type: Type.STRING, description: "Actionable fix if score < 80, else 'None'" }
          },
          required: ["score", "feedback", "fix"]
        }
      },
      required: ["visual", "audio", "copy"]
    },
    checks: {
      type: Type.OBJECT,
      properties: {
        complexity: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Complexity"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Reading level analysis" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        storytelling: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Storytelling"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Hero/Guide/Solution framework check" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        hook: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Hook"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Is the first 3s compelling?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        captions: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Captions"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Are captions present and readable?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        copyVisibility: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Copy Visibility"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Is on-screen text legible?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        visualQuality: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Visual Quality"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Resolution, lighting, coloring" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        audioQuality: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Audio Quality"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Clear voiceover, balanced music" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        pacing: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Pacing"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Is the flow fast/engaging?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        painPoint: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Pain Point"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Is the customer problem clear?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        },
        cta: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Call to Action"] },
            status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN"] },
            details: { type: Type.STRING, description: "Is the next step clear?" },
            fix: { type: Type.STRING, description: "Brief actionable fix if status is FAIL/WARN, else 'None'" }
          },
          required: ["label", "status", "details", "fix"]
        }
      },
      required: [
        "complexity", 
        "storytelling", 
        "hook", 
        "captions", 
        "copyVisibility", 
        "visualQuality", 
        "audioQuality",
        "pacing",
        "painPoint",
        "cta"
      ]
    },
    timestampedNotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Format MM:SS" },
          note: { type: Type.STRING, description: "The specific critique" }
        },
        required: ["time", "note"]
      }
    }
  },
  required: ["overallScore", "brutalSummary", "categories", "checks", "timestampedNotes"]
};

export const analyzeVideo = async (base64Data: string, mimeType: string): Promise<AnalysisData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this ad video. Be brutal. Follow the JSON schema strictly."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisData;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};