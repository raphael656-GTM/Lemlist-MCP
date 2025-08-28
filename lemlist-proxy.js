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
    
    // Transform MCP request to server format
    let serverRequest;
    if (request.method === 'initialize') {
      // Handle initialize request directly
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2025-06-18',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'lemlist-mcp-server',
            version: '1.0.0'
          }
        }
      }));
      return;
    } else if (request.method === 'tools/list') {
      serverRequest = { method: 'tools/list' };
    } else if (request.method === 'tools/call') {
      serverRequest = { method: 'tools/call', params: request.params };
    } else {
      // Unknown method, return error
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` }
      }));
      return;
    }
    
    // Forward request to Railway-hosted MCP server
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
        'X-Lemlist-API-Key': LEMLIST_API_KEY // Pass user's Lemlist API key
      },
      body: JSON.stringify(serverRequest),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: { 
          code: -32603, 
          message: `Server error: ${response.status} ${response.statusText}`,
          data: errorText
        }
      }));
      return;
    }

    const result = await response.json();
    
    // Return result in MCP format
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      result: result
    }));
    
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