import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

async function runHealthCheck() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('=====================================================');
  console.log('🤖 IGNITE AFRICA AI – POCKET SCHOOL PRO');
  console.log('🔌 AI INTEGRATION PRODUCTION VERIFICATION HEALTHCHECK');
  console.log('=====================================================');

  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY is not defined in the environment.');
    console.error('Please configure your API key inside .env or as a Cloud Run environment variable secret.');
    process.exit(1);
  }

  // Obfuscate the API key for logging purposes
  const obfuscatedKey = apiKey.length > 8 
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` 
    : '***';
  console.log(`🔑 API Key Configured: [${obfuscatedKey}]`);
  console.log('📡 Contacting Google Gemini AI endpoint...');

  const startTime = Date.now();

  try {
    // Instantiate the official GoogleGenAI SDK client
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-healthcheck',
        }
      }
    });

    // Send a lightweight probe prompt to the fast and efficient gemini-2.5-flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with a short, inspiring 1-sentence welcome message for Ignite Africa Pocket School students.',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response || !response.text) {
      throw new Error('Successfully completed request but returned an empty response text structure.');
    }

    console.log('\n✅ VERIFICATION SUCCESSFUL!');
    console.log(`⏱️  Latency: ${duration} seconds`);
    console.log('-----------------------------------------------------');
    console.log('📝 AI Response:');
    console.log(`"${response.text.trim()}"`);
    console.log('-----------------------------------------------------');
    console.log('🚀 Your production AI integration is fully functional and ready to serve!');
    console.log('=====================================================');
    
    process.exit(0);
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('\n❌ VERIFICATION FAILED!');
    console.error(`⏱️  Elapsed Time: ${duration} seconds`);
    console.error('-----------------------------------------------------');
    console.error('🔍 Diagnostic Info:');
    
    if (error.message) {
      console.error(`Error Message: ${error.message}`);
    } else {
      console.error('Error Details:', error);
    }
    
    console.error('\n🛠️  Troubleshooting Steps:');
    console.error('1. Verify your GEMINI_API_KEY is correct, active, and has billing configured if quotas are exceeded.');
    console.error('2. Confirm your cloud network egress allows connections to: generativelanguage.googleapis.com');
    console.error('3. Ensure correct IAM permissions are set if routing through Vertex AI service accounts.');
    console.log('=====================================================');
    
    process.exit(1);
  }
}

runHealthCheck();
