# 🚀 Railway Deployment Guide - Lemlist MCP Server

This guide shows you how to deploy the Lemlist MCP Server to Railway for multi-user hosting.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Lemlist API Key**: Get your API key from [Lemlist.com API settings](https://app.lemlist.com/settings/integrations)
3. **Git Repository**: Fork or clone this repository

## 🔧 One-Click Railway Deployment

### Method 1: Deploy Button (Easiest)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Method 2: Manual Deployment

1. **Connect Repository**
   ```bash
   # Clone the repository
   git clone https://github.com/raphael656-GTM/Lemlist-MCP.git
   cd Lemlist-MCP
   ```

2. **Create Railway Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `Lemlist-MCP` repository
   - Railway will auto-detect the configuration from `railway.json`

3. **Configure Environment Variables**
   
   In Railway dashboard → Project → Variables tab, add:
   
   ```env
   LEMLIST_API_KEY=your_actual_lemlist_api_key_here
   NODE_ENV=production
   PORT=3000
   ```

   **Optional Security Variables:**
   ```env
   API_KEY_REQUIRED=true
   MCP_API_KEY=your_secure_random_api_key
   ALLOWED_ORIGINS=https://your-allowed-domain.com
   ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Your server will be available at `https://your-app-name.railway.app`

## 🔒 Security Configuration

### Public Access (Default)
- No API key required
- Anyone can use the MCP server
- Good for personal or trusted team use

### Secure Access (Recommended for Production)
```env
API_KEY_REQUIRED=true
MCP_API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=https://claude.ai,https://your-app.com
```

## 🧪 Testing Your Deployment

1. **Health Check**
   ```bash
   curl https://your-app-name.railway.app/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "service": "lemlist-mcp-server",
     "version": "1.0.0"
   }
   ```

2. **API Test**
   ```bash
   curl -X POST https://your-app-name.railway.app/mcp \
     -H "Content-Type: application/json" \
     -d '{"method": "tools/list"}'
   ```

## 🎯 Claude Desktop Integration

### For Hosted MCP Server

Edit your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lemlist": {
      "command": "node",
      "args": ["-e", "
        import fetch from 'node-fetch';
        const server = 'https://your-app-name.railway.app';
        const apiKey = 'your-api-key-if-required';
        
        process.stdin.on('data', async (data) => {
          try {
            const request = JSON.parse(data.toString());
            const response = await fetch(`${server}/mcp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
              },
              body: JSON.stringify(request)
            });
            const result = await response.json();
            console.log(JSON.stringify(result));
          } catch (error) {
            console.error(JSON.stringify({ error: error.message }));
          }
        });
      "],
      "env": {
        "LEMLIST_API_KEY": "your_lemlist_api_key"
      }
    }
  }
}
```

### Simple Local Proxy (Alternative)

Create a local proxy script:

```javascript
// lemlist-proxy.js
import fetch from 'node-fetch';

const SERVER_URL = 'https://your-app-name.railway.app';
const API_KEY = 'your-api-key-if-required'; // Optional

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
      },
      body: JSON.stringify(request)
    });
    const result = await response.json();
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
  }
});
```

Then in Claude Desktop config:
```json
{
  "mcpServers": {
    "lemlist": {
      "command": "node",
      "args": ["path/to/lemlist-proxy.js"],
      "env": {
        "LEMLIST_API_KEY": "your_lemlist_api_key"
      }
    }
  }
}
```

## 🚀 Multi-User Setup

### For Teams
1. Deploy once on Railway
2. Share the Railway URL with team members
3. Each user configures their Claude Desktop with the shared URL
4. Each user uses their own Lemlist API key

### For Organizations
1. Use secure API key authentication
2. Set `ALLOWED_ORIGINS` to your domain
3. Distribute the MCP API key securely
4. Monitor usage through Railway logs

## 📊 Monitoring & Logs

- **Railway Dashboard**: View deployment status and logs
- **Health Endpoint**: Monitor uptime at `/health`
- **Usage Analytics**: Check Railway metrics for request volume

## 🔧 Troubleshooting

### Common Issues

1. **Build Failed**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Health Check Failing**
   - Ensure `PORT` environment variable is set
   - Check Railway logs for startup errors

3. **API Errors**
   - Verify `LEMLIST_API_KEY` is correctly set
   - Test API key directly with Lemlist API

4. **Authentication Issues**
   - Check `API_KEY_REQUIRED` and `MCP_API_KEY` settings
   - Verify CORS settings with `ALLOWED_ORIGINS`

### Debug Mode
Set environment variable:
```env
DEBUG=true
```

## 💡 Best Practices

1. **Security**: Always use API key authentication for production
2. **Rate Limiting**: Monitor Railway usage to avoid overages
3. **Error Handling**: Check logs regularly for issues
4. **Updates**: Keep the server updated by redeploying from Git
5. **Monitoring**: Set up Railway alerts for downtime

## 🆘 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Lemlist API Docs**: [developer.lemlist.com](https://developer.lemlist.com)
- **Issues**: Create an issue in this repository

---

✅ **Success Criteria**: When properly deployed, you should be able to use Lemlist commands in Claude Desktop like:
- "Get a list of my Lemlist campaigns" 
- "Show me leads from campaign X"
- "Create a new campaign called 'Test Campaign'"