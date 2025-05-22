#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate API key at startup
if (!process.env.FRIDAY_API_KEY) {
  console.error(JSON.stringify({
    error: "Missing FRIDAY_API_KEY environment variable"
  }));
  process.exit(1);
}

const server = new McpServer({
  name: "Friday Data MCP",
  version: "1.0.1",
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
    sampling: false
  },
  metadata: {
    description: "Easiest way to integrate unblocked webscraping with your LLM",
    author: "Friday Data"
  }
});

// Profile scraping tool
server.tool(
  "scrape_linkedin_profile",
  "Scrapes a LinkedIn profile and returns structured data about the person",
  {
    profile_url: z.string().url()
  },
  async ({ profile_url }) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // Increased to 60 second timeout

      const response = await fetch(
        `https://api.fridaydata.tech/profile?profile_url=${encodeURIComponent(profile_url)}`,
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      if (!data || !data.profile) {
        throw new Error('Invalid response format from API');
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(data.profile, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Profile scraping error:', error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ error: "Request timed out after 60 seconds" })
          }],
          isError: true
        };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
        }],
        isError: true
      };
    }
  }
);

// Company analysis tool
server.tool(
  "analyze_linkedin_company",
  "Analyzes a LinkedIn company page and returns insights",
  {
    linkedin_url: z.string().url()
  },
  async ({ linkedin_url }) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // Increased to 60 second timeout

      const response = await fetch(
        'https://api.fridaydata.tech/analyze-company',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ linkedin_url }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      if (!data) {
        throw new Error('Invalid response format from API');
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
      console.error('Company analysis error:', error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ error: "Request timed out after 60 seconds" })
          }],
          isError: true
        };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
        }],
        isError: true
      };
    }
  }
);

// Start server with error handling
try {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.error(JSON.stringify({ status: "Server started successfully" }));
} catch (error) {
  console.error(JSON.stringify({ 
    error: "Failed to start server",
    details: error instanceof Error ? error.message : 'Unknown error'
  }));
  process.exit(1);
} 