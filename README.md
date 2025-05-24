# FridayData MCP Server

A powerful Model Context Protocol (MCP) server providing access to LinkedIn scraping, web search, and website data extraction capabilities.

## Overview

This MCP server exposes three key endpoints through a simple API interface:

1. LinkedIn Profile Scraping (`/profile`) - Extract structured data from LinkedIn profiles
2. LinkedIn Company Analysis (`/analyze-company`) - Gather insights from company pages
3. Website Information Extraction (`/extract`) - Extract custom data from any website
4. Web Search (`/search`) - Perform location-aware web searches

Get started by obtaining your API key from [Friday Data](https://fridaydata.tech).

## Key Features

- **LinkedIn Profile Scraping**:
  - Full profile data in JSON format
  - 60 second timeout per request
  - Error handling with detailed messages
  - Automatic response validation

- **LinkedIn Company Analysis**:
  - POST request to `/analyze-company`
  - Company insights in structured format
  - Configurable timeout settings
  - Comprehensive error reporting

- **Website Data Extraction**:
  - Custom schema support
  - Flexible query parameters
  - JSON response format
  - Built-in timeout protection

- **Web Search Capabilities**:
  - Location-based searching (default: US)
  - Configurable result count (1-100)
  - Structured JSON responses
  - Robust error handling

## Technical Details

- All endpoints require `X-API-KEY` header
- Responses are in JSON format
- 60 second timeout on all requests
- Automatic request abortion on timeout
- Full error stack traces in development

## Quick Start

1. Get your API key from [Friday Data](https://fridaydata.tech)

## Setup

Add this to your MCP client configuration:

```json
{
  "friday_data_mcp": {
    "name": "Friday Data MCP",
    "command": "npx",
    "args": [
      "fridaydata-mcp"
    ],
    "env": {
      "FRIDAY_API_KEY": "YOUR_API_KEY"
    },
    "capabilities": {
      "tools": true,
      "resources": false,
      "prompts": false,
      "sampling": false
    }
  }
}