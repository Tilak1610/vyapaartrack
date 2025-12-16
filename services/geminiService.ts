import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, BusinessUnit } from "../types";

// Helper to resize image and convert to base64
const resizeImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG at 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        // Remove prefix for API usage
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return resizeImage(file);
};

export interface ReceiptAnalysisResult {
  amount?: number;
  date?: string;
  merchant?: string;
  category?: string;
  businessUnit?: string;
  description?: string;
  referenceNumber?: string;
  confidence: number;
}

export const analyzeReceiptImage = async (
  base64Image: string, 
  availableCategories: string[], 
  availableBusinesses: string[]
): Promise<ReceiptAnalysisResult> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Returning mock data.");
    return {
      amount: 1234.50,
      date: new Date().toISOString().split('T')[0],
      merchant: "Demo Merchant (No API Key)",
      category: availableCategories[0] || "Materials",
      description: "Auto-detected from receipt (Mock)",
      referenceNumber: "UPI-1234567890",
      confidence: 0.9,
      businessUnit: availableBusinesses[0] || "Head Office"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze this image of a receipt, invoice, or payment screenshot (PhonePe/GPay).
      Extract the following information:
      - Total Amount (number)
      - Date (YYYY-MM-DD format)
      - Merchant or Payee Name
      - A short description of the items/service
      - UTR or Transaction Reference Number (if visible)
      - Guess the Expense Category strictly from this list: ${availableCategories.join(', ')}
      - Guess the Business Unit strictly from this list based on context if visible: ${availableBusinesses.join(', ')}. If unsure, leave null.
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            merchant: { type: Type.STRING },
            description: { type: Type.STRING },
            referenceNumber: { type: Type.STRING },
            category: { type: Type.STRING },
            businessUnit: { type: Type.STRING },
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    let matchedCategory = availableCategories.includes(result.category) ? result.category : "Other";
    let matchedBusiness = availableBusinesses.includes(result.businessUnit) ? result.businessUnit : undefined;

    return {
      amount: result.amount,
      date: result.date,
      merchant: result.merchant,
      description: result.description,
      referenceNumber: result.referenceNumber,
      category: matchedCategory,
      businessUnit: matchedBusiness,
      confidence: 1
    };

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("Failed to analyze receipt image.");
  }
};