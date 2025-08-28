#!/usr/bin/env node

/**
 * Lemlist MCP Proxy for Railway Hosted Server
 * 
 * This proxy connects Claude Desktop to a Railway-hosted Lemlist MCP server.
 * It forwards MCP requests to the remote server and returns responses.
 */

import fetch from 'node-fetch';

// Configuration from environment variables
const SERVER_URL = process.env.RAILWAY_URL || process.env.LEMLIST_MCP_SERVER_URL;
const API_KEY = process.env.MCP_API_KEY; // Optional, for secured servers
const LEMLIST_API_KEY = process.env.LEMLIST_API_KEY; // User's Lemlist API key

if (!SERVER_URL) {
  console.error(JSON.stringify({
    error: 'RAILWAY_URL or LEMLIST_MCP_SERVER_URL environment variable is required'
  }));
  process.exit(1);
}

if (!LEMLIST_API_KEY) {
  console.error(JSON.stringify({
    error: 'LEMLIST_API_KEY environment variable is required'
  }));
  process.exit(1);
}

// Handle incoming MCP requests from Claude Desktop
process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    
    // Forward request to Railway-hosted MCP server
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
        'X-Lemlist-API-Key': LEMLIST_API_KEY // Pass user's Lemlist API key
      },
      body: JSON.stringify(request),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(JSON.stringify(result));
    
  } catch (error) {
    console.error(JSON.stringify({
      error: `Proxy Error: ${error.message}`,
      details: error.stack
    }));
  }
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Health check on startup
async function healthCheck() {
  try {
    const response = await fetch(`${SERVER_URL}/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const health = await response.json();
      console.error(`✅ Connected to Lemlist MCP Server: ${health.service} v${health.version}`);
    } else {
      console.error(`⚠️  Server health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Cannot connect to server: ${error.message}`);
  }
}

// Run health check on startup
healthCheck();