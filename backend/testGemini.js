import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

dotenv.config();

async function testGemini() {
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('test-output.txt', msg + '\n');
  };
  
  try {
    log('🔍 Testing Gemini API...');
    log('🔑 API Key present: ' + !!process.env.GEMINI_API_KEY);
    log('🔑 API Key length: ' + process.env.GEMINI_API_KEY?.length);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test with gemini-pro first (most basic model)
    log('\n🧪 Testing gemini-pro...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent("Hello! Please respond with 'API is working!'");
    const text = result.response.text();
    
    log('✅ SUCCESS! Gemini response: ' + text);
    
  } catch (error) {
    log('❌ Error details:');
    log('Message: ' + error.message);
    log('Status: ' + error.status);
    log('StatusText: ' + error.statusText);
  }
}

testGemini();