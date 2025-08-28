# 🚀 MCP Lemlist Server Deployment Steps

## Sub-Agent Architecture Integration

This MCP server includes an advanced sub-agent architecture with:
- **18 Specialized Agents** across 3 tiers (Generalists → Specialists → Architects)
- **Intelligent Task Routing** with 80/15/4/1 distribution
- **Quality Assurance Framework** with automated validation
- **Context Management** with learning and pattern recognition
- **Error Recovery System** with automatic escalation and feedback loops

## Lemlist Integration Setup

1. **Get Lemlist API Key**
   - Log into Lemlist: https://app.lemlist.com
   - Navigate to Settings → Integrations → API
   - Generate or copy your API key
   - Note: Lemlist uses API key authentication (not OAuth)

2. **Configure Environment Variables**
   - Run: `cp .env.example .env`
   - Edit .env file with your API credentials:
     - `LEMLIST_API_KEY=your_lemlist_api_key_here`
     - Keep other settings as default

3. **Run Setup Script**
   - Run: `npm run setup`
   - This will:
     - Guide you through API key setup
     - Test your Lemlist API connection
     - Verify account access and permissions
     - Save configuration securely

4. **Test Server Locally**
   - Run: `npm start`
   - Verify no errors in console
   - Test with debug mode: `DEBUG=true npm start`
   - Check sub-agent system: Look for "[SubAgent]" logs

5. **Configure Claude Desktop**
   - Edit Claude config file:
     - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Add MCP server configuration:
   ```json
   {
     "mcpServers": {
       "lemlist": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-lemlist-server/src/index.js"],
         "env": {
           "LEMLIST_API_KEY": "your_actual_api_key"
         }
       }
     }
   }
   ```

6. **Test in Claude Desktop**
   - Quit Claude Desktop completely
   - Restart Claude Desktop
   - Test health check: "Check the health of the Lemlist server"
   - Test basic commands:
     - "Get a list of my Lemlist campaigns"
     - "Show me campaign statistics for campaign ID xyz"
     - "Create a new email campaign for product launch"

## Sub-Agent Architecture Commands

Test the intelligent routing system:

### Tier 1 Tasks (Quick Consultation)
- "Help me design an email template structure" → **Frontend Generalist**
- "Set up basic campaign analytics" → **Data Generalist**
- "Configure API authentication" → **Security Generalist**

### Tier 2 Tasks (Deep Analysis)  
- "Optimize database queries for campaign data" → **Database Specialist**
- "Design a complex email sequence API" → **API Design Specialist**
- "Implement OAuth2 integration with Lemlist" → **Auth Systems Specialist**

### Tier 3 Tasks (Architectural Coordination)
- "Design enterprise email marketing platform" → **System Architect**
- "Plan horizontal scaling for email processing" → **Scale Architect**
- "Implement data governance for customer data" → **Data Architect**

## Available Lemlist Tools

### Campaign Management
- `get_campaigns` - List all campaigns
- `get_campaign` - Get specific campaign details
- `create_campaign` - Create new email campaign with sequences
- `update_campaign` - Modify existing campaign
- `delete_campaign` - Remove campaign

### Lead Management
- `get_leads` - Retrieve leads (with filtering)
- `add_lead` - Add single lead to campaign
- `bulk_add_leads` - Efficient bulk lead import
- `update_lead` - Modify lead information
- `delete_lead` - Remove lead from campaign

### Analytics & Reporting
- `get_activities` - Campaign activities and events
- `get_campaign_stats` - Detailed performance metrics

### High-Level Workflows
- `create_complete_campaign` - End-to-end campaign setup with leads
- `health_check` - API connection and system diagnostics

## Example Usage

### Create Complete Email Campaign
```
"Create a complete email campaign called 'Q1 Product Launch' with a 5-email sequence:
1. Introduction email (immediate)
2. Feature showcase (2 days delay)
3. Customer testimonials (5 days delay)  
4. Limited time offer (7 days delay)
5. Final reminder (10 days delay)

Add 100 leads from our prospect database with custom fields for company size and industry."
```

### Bulk Lead Management
```
"Import 500 leads from a CSV file into campaign 'Enterprise Outreach 2024' with proper data validation and duplicate detection."
```

### Advanced Analytics
```
"Generate a comprehensive performance report for all campaigns in the last 30 days, including open rates, click-through rates, reply rates, and ROI analysis."
```

## Quality Assurance Features

The sub-agent system includes:
- **Expertise Alignment Validation** - Ensures right specialist for each task
- **Implementation Viability Checks** - Validates resource and timeline feasibility  
- **Risk Assessment** - Identifies technical, security, and business risks
- **Consistency Verification** - Maintains architectural alignment
- **Security Validation** - Prevents vulnerability introduction

## Learning & Optimization

The system continuously learns from:
- Task execution outcomes
- User satisfaction feedback
- Performance metrics
- Error patterns and recoveries

This enables:
- Improved task routing accuracy
- Better specialist selection
- Optimized complexity thresholds
- Enhanced pattern recognition

## Troubleshooting

### Common Issues

**API Key Issues**
```bash
npm run setup  # Re-run setup wizard
```

**Sub-Agent Routing Problems**
- Check logs for "[SubAgent]" messages
- Verify `sub-agents/` directory structure
- Review `config/sub-agent-config.json`

**Claude Desktop Connection Issues**
- Verify absolute file paths in config
- Check environment variable setup
- Restart Claude Desktop after config changes

### Debug Mode
```bash
DEBUG=true npm start
```

### System Status
In Claude Desktop:
```
"Show me the sub-agent system status and performance metrics"
```

## Success Criteria

✅ **Lemlist Integration**: All API endpoints accessible and functional
✅ **Sub-Agent Architecture**: Intelligent routing and specialist consultation working
✅ **Quality Assurance**: Automated validation and consistency checks active
✅ **Learning System**: Context management and pattern recognition enabled
✅ **Error Recovery**: Automatic escalation and feedback integration operational

The system is ready when:
1. Health check returns "healthy" status
2. Sub-agent logs show successful initialization
3. Test commands execute without errors
4. Quality metrics show scores > 0.8
5. Task routing distributes according to 80/15/4/1 targets