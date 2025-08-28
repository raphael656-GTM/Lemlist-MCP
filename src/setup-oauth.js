#!/usr/bin/env node

/**
 * Setup OAuth Flow for Lemlist MCP Server
 * Note: Lemlist primarily uses API key authentication
 * This file is kept for compatibility and potential future OAuth implementation
 */

import express from 'express';
import open from 'open';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

class LemlistOAuthSetup {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.envPath = path.resolve('.env');
  }

  async setup() {
    console.log('🚀 Lemlist MCP Server Setup');
    console.log('============================\n');

    // Check if API key is already configured
    if (process.env.LEMLIST_API_KEY) {
      console.log('✅ Lemlist API key already configured');
      console.log('   API Key:', this.maskApiKey(process.env.LEMLIST_API_KEY));
      console.log('\nTo reconfigure, delete the API key from your .env file and run this setup again.\n');
      
      const testResult = await this.testApiConnection();
      if (testResult.success) {
        console.log('✅ API connection test successful!');
        console.log(`   Account: ${testResult.account?.email || 'Unknown'}`);
        console.log(`   Plan: ${testResult.account?.planType || 'Unknown'}`);
      } else {
        console.log('❌ API connection test failed:', testResult.error);
        console.log('   Please check your API key configuration.');
      }
      return;
    }

    console.log('Lemlist uses API key authentication.');
    console.log('Please follow these steps to get your API key:\n');

    console.log('1. 📧 Log into your Lemlist account');
    console.log('2. ⚙️  Navigate to Settings → Integrations → API');
    console.log('3. 🔑 Generate or copy your API key');
    console.log('4. 📝 Enter the API key below\n');

    // Open Lemlist integrations page
    console.log('Opening Lemlist integrations page...');
    try {
      await open('https://app.lemlist.com/integrations/api');
    } catch (error) {
      console.log('Could not open browser automatically.');
      console.log('Please manually navigate to: https://app.lemlist.com/integrations/api');
    }

    // Prompt for API key
    await this.promptForApiKey();
  }

  async promptForApiKey() {
    const { createInterface } = await import('readline');
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('Enter your Lemlist API key: ', async (apiKey) => {
        readline.close();
        
        if (!apiKey || apiKey.trim().length === 0) {
          console.log('❌ No API key provided. Setup cancelled.');
          process.exit(1);
        }

        // Test the API key
        console.log('\n🔄 Testing API key...');
        const testResult = await this.testApiKey(apiKey.trim());
        
        if (testResult.success) {
          console.log('✅ API key is valid!');
          console.log(`   Account: ${testResult.account?.email || 'Unknown'}`);
          console.log(`   Plan: ${testResult.account?.planType || 'Unknown'}`);
          
          // Save to .env file
          await this.saveApiKey(apiKey.trim());
          console.log('✅ API key saved to .env file');
          
          console.log('\n🎉 Setup completed successfully!');
          console.log('\nNext steps:');
          console.log('1. Run: npm start');
          console.log('2. Configure Claude Desktop with this MCP server');
          
        } else {
          console.log('❌ API key test failed:', testResult.error);
          console.log('Please verify your API key and try again.');
          process.exit(1);
        }
        
        resolve();
      });
    });
  }

  async testApiKey(apiKey) {
    try {
      const { default: axios } = await import('axios');
      const response = await axios.get('https://api.lemlist.com/api/account', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        account: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  async testApiConnection() {
    return await this.testApiKey(process.env.LEMLIST_API_KEY);
  }

  async saveApiKey(apiKey) {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(this.envPath)) {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    }

    // Remove existing LEMLIST_API_KEY line
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('LEMLIST_API_KEY='))
      .join('\n');

    // Add new API key
    envContent = envContent.trim() + `\nLEMLIST_API_KEY=${apiKey}\n`;

    // Write back to file
    fs.writeFileSync(this.envPath, envContent);
  }

  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) return '[HIDDEN]';
    return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new LemlistOAuthSetup();
  setup.setup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}