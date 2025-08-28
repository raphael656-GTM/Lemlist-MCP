# MCP Lemlist Server

A comprehensive Model Context Protocol (MCP) server for Lemlist.com integration, featuring advanced sub-agent architecture for intelligent task routing and quality assurance.

## Features

### 🚀 Core Lemlist Integration
- **Campaign Management**: Create, update, delete, and manage email campaigns
- **Lead Management**: Add, update, remove leads with bulk operations support  
- **Email Sequences**: Build sophisticated email sequences with delays and triggers
- **Analytics & Reporting**: Track campaign performance, open rates, click rates, and replies
- **Template Management**: Create and manage reusable email templates
- **Team Collaboration**: Manage team members and account settings

### 🧠 Advanced Sub-Agent Architecture
- **Intelligent Task Routing**: 80/15/4/1 distribution across direct/tier1/tier2/tier3 specialists
- **18 Specialized Agents**: From generalists to architects across 3 tiers
- **Quality Assurance Framework**: Automated validation and consistency checks
- **Context Management**: Learning system with pattern recognition
- **Error Recovery**: Automatic escalation and feedback loops

### 🛠️ High-Level Workflow Tools
- **Complete Campaign Creation**: Set up campaigns with leads in one operation
- **Bulk Operations**: Process multiple leads, campaigns, and templates efficiently
- **Export Capabilities**: Export campaign data in JSON or CSV formats
- **Health Monitoring**: API connection monitoring and diagnostics

## 🚀 Quick Start

### Option 1: Railway Hosting (Recommended for Teams)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/lemlist-mcp)

1. **One-Click Deploy**: Click the Railway button above
2. **Add API Key**: Set `LEMLIST_API_KEY` in Railway dashboard
3. **Configure Claude**: Use the Railway URL in your Claude config

📖 **[Complete Railway Setup Guide →](RAILWAY-DEPLOYMENT.md)**

### Option 2: Local Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd mcp-lemlist-server
npm install

# 2. Setup API key
cp .env.example .env
# Edit .env and add your LEMLIST_API_KEY

# 3. Start server
npm start
```

### Claude Desktop Configuration

**Railway Hosted (Multi-user):**
```json
{
  "mcpServers": {
    "lemlist": {
      "command": "node",
      "args": ["lemlist-proxy.js"],
      "env": {
        "LEMLIST_API_KEY": "your_lemlist_api_key",
        "RAILWAY_URL": "https://your-app.railway.app"
      }
    }
  }
}
```

**Local Installation:**
```json
{
  "mcpServers": {
    "lemlist": {
      "command": "node",
      "args": ["/absolute/path/to/src/index.js"],
      "env": {
        "LEMLIST_API_KEY": "your_lemlist_api_key"
      }
    }
  }
}
```

**Configuration Files:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## Sub-Agent Architecture

### Tier 1 - Quick Consultation (15% of tasks)
- **Architecture Generalist**: System design and scalability
- **Security Generalist**: Authentication and data protection  
- **Performance Generalist**: Optimization and monitoring
- **Data Generalist**: Database design and analytics
- **Integration Generalist**: APIs and service communication
- **Frontend Generalist**: UI/UX and responsive design

### Tier 2 - Deep Analysis (4% of tasks)  
- **Database Specialist**: Advanced query optimization and performance
- **API Design Specialist**: Complex REST/GraphQL architectures
- **Auth Systems Specialist**: OAuth, SSO, and identity management
- **Performance Optimization Specialist**: Advanced profiling and optimization
- **ML Integration Specialist**: AI/ML model integration
- **Testing Strategy Specialist**: Advanced testing frameworks and CI/CD

### Tier 3 - Architectural Coordination (1% of tasks)
- **System Architect**: Enterprise architecture and cross-domain coordination
- **Integration Architect**: Service mesh and distributed systems
- **Scale Architect**: Horizontal scaling and fault tolerance
- **Security Architect**: Security governance and compliance
- **Data Architect**: Data lakes, warehouses, and governance
- **Governance Architect**: Policy enforcement and risk management

## Available Tools

### Campaign Management
- `get_campaigns` - Retrieve all campaigns
- `get_campaign` - Get specific campaign details
- `create_campaign` - Create new email campaign
- `update_campaign` - Update existing campaign
- `delete_campaign` - Remove campaign

### Lead Management  
- `get_leads` - Retrieve leads (with filtering)
- `add_lead` - Add single lead to campaign
- `bulk_add_leads` - Add multiple leads efficiently
- `update_lead` - Update lead information
- `delete_lead` - Remove lead from campaign

### Analytics & Activity
- `get_activities` - Campaign activities and events
- `get_campaign_stats` - Detailed performance statistics

### Templates & Content
- `get_templates` - Retrieve email templates
- `create_template` - Create reusable email template

### Team & Account
- `get_team_members` - List team members
- `get_account_info` - Account details and limits

### High-Level Workflows
- `create_complete_campaign` - End-to-end campaign setup
- `health_check` - API connection diagnostics

## Usage Examples

### Creating a Complete Email Campaign

```javascript
// Through Claude Desktop
"Create a complete email campaign called 'Product Launch 2024' with a 3-email sequence and add 50 leads from our prospect database"
```

### Bulk Lead Management

```javascript
// Add multiple leads efficiently
{
  "campaignId": "camp_123",
  "leads": [
    {
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe", 
      "companyName": "Example Corp"
    },
    // ... more leads
  ]
}
```

### Advanced Analytics

```javascript
// Get comprehensive campaign performance
{
  "campaignId": "camp_123"
}
// Returns open rates, click rates, replies, bounces, etc.
```

## Configuration

### Environment Variables

```bash
LEMLIST_API_KEY=your_lemlist_api_key    # Required
DEBUG=false                             # Optional debug mode  
PORT=3000                              # Optional server port
HOST=localhost                         # Optional server host
```

### Sub-Agent Configuration

Customize the sub-agent architecture in `config/sub-agent-config.json`:

```json
{
  "routing": {
    "distributionTargets": {
      "direct": 80,
      "tier1": 15, 
      "tier2": 4,
      "tier3": 1
    },
    "complexityThresholds": {
      "direct": 3,
      "tier1": 6,
      "tier2": 8, 
      "tier3": 10
    }
  }
}
```

## Quality Assurance

The system includes comprehensive quality assurance:

- **Expertise Alignment**: Validates specialist assignment
- **Recommendation Quality**: Assesses completeness and clarity
- **Implementation Viability**: Checks resource and timeline feasibility
- **Risk Assessment**: Identifies technical, security, and business risks
- **Consistency Verification**: Ensures architectural alignment
- **Security Validation**: Checks for vulnerability introduction

## Error Handling & Recovery

- **Automatic Escalation**: Failed tasks escalate to higher tiers
- **Feedback Integration**: User feedback improves routing decisions  
- **Learning Updates**: System learns from outcomes to optimize performance
- **Graceful Degradation**: Fallback strategies for API failures

## API Rate Limiting

The client includes built-in rate limiting and retry logic:
- Batch processing for bulk operations
- Automatic delays between API calls
- Exponential backoff for failed requests
- Respects Lemlist API limits

## Troubleshooting

### Common Issues

**API Key Invalid**
```bash
npm run setup  # Re-run setup to verify credentials
```

**Connection Timeout**
- Check internet connection
- Verify Lemlist service status
- Review API key permissions

**Claude Desktop Not Connecting**
- Verify absolute paths in configuration
- Check file permissions
- Restart Claude Desktop

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm start
```

### Health Check

Test your configuration:
```bash
# In Claude Desktop
"Check the health of the Lemlist server"
```

## Development

### Project Structure

```
mcp-lemlist-server/
├── src/
│   ├── index.js              # Main MCP server
│   ├── lemlist-client.js     # Lemlist API client
│   └── setup-oauth.js        # Setup utility
├── sub-agents/               # Sub-agent architecture
│   ├── routing/              # Task routing logic
│   ├── specialists/          # Specialist definitions
│   ├── quality/              # Quality assurance
│   ├── context/              # Context management
│   └── recovery/             # Error recovery
├── config/                   # Configuration files
└── README.md
```

### Adding New Tools

1. Add tool definition to `ListToolsRequestSchema` handler
2. Implement handler in `CallToolRequestSchema` switch statement  
3. Add corresponding method to `LemlistClient`
4. Update documentation

### Extending Sub-Agents

1. Define new specialist in `SpecialistRegistry.js`
2. Update routing logic in `TaskRouter.js`
3. Add quality checks in `QualityAssurance.js`
4. Configure in `sub-agent-config.json`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- 🐛 Bug reports: [GitHub Issues](https://github.com/your-org/mcp-lemlist-server/issues)
- 📖 Documentation: [Wiki](https://github.com/your-org/mcp-lemlist-server/wiki)  
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/mcp-lemlist-server/discussions)

---

Built with ❤️ for the Claude MCP ecosystem