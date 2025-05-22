# LinkedIn MCP Server

A powerful Model Context Protocol (MCP) server for extracting structured data from LinkedIn profiles and company pages.

## Overview

This MCP server provides a reliable way to scrape and analyze LinkedIn data through a simple API interface. Get started by obtaining your API key from [Friday Data](https://fridaydata.tech).

## Key Features

- **Profile Data Extraction**: Automatically extract structured data from LinkedIn profile URLs including:
  - Work experience
  - Education
  - Skills
  - Certifications
  - And more

- **Company Intelligence**: Analyze LinkedIn company pages to gather:
  - Company overview
  - Employee count
  - Industry information  
  - Recent updates

- **Production Ready**:
  - Robust error handling
  - Input validation
  - Rate limiting
  - Automatic retries

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
}```