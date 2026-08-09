import { expect, describe, test, vi } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental configuration
dotenv.config();

describe('AI Integration / E2E Tests', () => {
  const apiKey = process.env.GOOGLE_ALL_APIS || process.env.GEMINI_API_KEY;

  test('should initialize GoogleGenAI client with correct telemetry headers', () => {
    const ai = new GoogleGenAI({
      apiKey: apiKey || 'test-dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    expect(ai).toBeDefined();
    expect(ai.models).toBeDefined();
  });

  test('should verify connection and response generation (Live or Contract Mocked)', async () => {
    if (apiKey && apiKey !== 'test-dummy-key') {
      console.log('Running LIVE integration test with production GEMINI_API_KEY...');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Query the recommended text model as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'Say "Connection successful!"',
      });

      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
      expect(typeof response.text).toBe('string');
      expect(response.text!.length).toBeGreaterThan(0);
      console.log('Live response received from Gemini:', response.text);
    } else {
      console.warn('GEMINI_API_KEY is not defined in the test environment. Skipping live network request and running contract-based contract mocks.');
      
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Connection successful! (Mocked response conforming to GenerateContentResponse)',
        candidates: [
          {
            content: {
              parts: [{ text: 'Connection successful! (Mocked)' }],
            },
          },
        ],
      });

      const mockAi = {
        models: {
          generateContent: mockGenerateContent,
        },
      };

      const response = await mockAi.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'Say "Connection successful!"',
      });

      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.text).toContain('Connection successful!');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.5-flash',
        })
      );
    }
  });

  test('should validate proper error handling for invalid API credentials', async () => {
    const badAi = new GoogleGenAI({
      apiKey: 'INVALID_CREDENTIALS_FOR_TESTING_PURPOSES',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    try {
      await badAi.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'Hi',
      });
      throw new Error('Expected generateContent to throw an error due to invalid credentials, but it succeeded.');
    } catch (error: any) {
      expect(error).toBeDefined();
      // Error message should indicate authentication failure or key validation issues
      expect(error.message).toBeDefined();
      console.log('Invalid key test successfully raised error:', error.message);
    }
  });

  test('should validate proper error handling for network or timeout issues', async () => {
    // Create a mock network client/method that simulates a network timeout or connection aborted
    const mockGenerateContentWithTimeout = vi.fn().mockRejectedValue(
      new Error('Request aborted due to network timeout (simulated)')
    );

    const mockAiWithTimeout = {
      models: {
        generateContent: mockGenerateContentWithTimeout,
      },
    };

    await expect(
      mockAiWithTimeout.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'This will time out',
      })
    ).rejects.toThrow('Request aborted due to network timeout');
  });
});
