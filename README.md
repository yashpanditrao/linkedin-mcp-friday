# LinkedIn MCP Server

A Model Context Protocol (MCP) server for LinkedIn profile and company data scraping.

Get your API Key from https://fridaydata.tech

## Features

- Profile scraping from LinkedIn URLs
- Company analysis from LinkedIn company pages
- Error handling and input validation
- Environment variable configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your LinkedIn API key to `.env`:
```
FRIDAY_API_KEY=your_api_key_here
```

## Usage

1. Start the server:
```bash
npx ts-node src/server.ts
```

2. Example API calls:

### Profile Scraping
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "CallTool",
    "params": {
      "name": "scrape_linkedin_profile",
      "arguments": {
        "profile_url": "https://linkedin.com/in/example-profile"
      }
    },
    "id": 1
  }'
```

### Company Analysis
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "CallTool",
    "params": {
      "name": "analyze_linkedin_company",
      "arguments": {
        "linkedin_url": "https://linkedin.com/company/example-company"
      }
    },
    "id": 2
  }'
```

## Development

- Written in TypeScript
- Uses Zod for input validation
- Implements MCP protocol specifications
- Includes error handling for API calls

## Environment Variables

- `FRIDAY_API_KEY`: Your API Key for authentication 
