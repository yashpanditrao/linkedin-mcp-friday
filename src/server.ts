// @ts-ignore - MCP SDK imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// @ts-ignore - MCP SDK imports
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// @ts-ignore - Zod import
import { z } from "zod";
// @ts-ignore - Dotenv import
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
  name: "LinkedIn Scraper",
  version: "1.0.0",
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
    sampling: false
  },
  metadata: {
    description: "A tool for scraping and analyzing LinkedIn profiles and companies",
    author: "MCP Community"
  }
});

// Profile scraping tool
server.tool(
  "scrape_linkedin_profile",
  "Scrapes a LinkedIn profile and returns structured data about the person",
  {
    profile_url: z.string().url()
  },
  async ({ profile_url }: { profile_url: string }): Promise<any> => {
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
  async ({ linkedin_url }: { linkedin_url: string }): Promise<any> => {
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

// Initialize LinkedIn
server.tool(
  "initialize_linkedin",
  "Initialize LinkedIn connection and authentication",
  {},
  async () => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/initialize',
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Scrape website
server.tool(
  "scrape_website",
  "Scrapes a website and returns content in requested formats",
  {
    url: z.string().url(),
    formats: z.array(z.enum(["html", "markdown", "links"])).default(["html"])
  },
  async ({ url, formats }: { url: string, formats: string[] }): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        'https://api.fridaydata.tech/scrape',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url, formats }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Crawl website
server.tool(
  "crawl_website",
  "Crawls a website by following internal links, returning content in requested formats",
  {
    url: z.string().url(),
    formats: z.array(z.enum(["html", "markdown", "links"])).default(["html", "markdown", "links"]),
    max_pages: z.number().int().positive().default(10)
  },
  async ({ url, formats, max_pages }: { url: string, formats: string[], max_pages: number }): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for crawling

      const response = await fetch(
        'https://api.fridaydata.tech/crawl',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url, formats, max_pages }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ error: "Request timed out after 120 seconds" })
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

// Extract data from website
server.tool(
  "extract_data",
  "Extracts structured data from a website based on a query or custom schema",
  {
    url: z.string().url(),
    query: z.string(),
    custom_schema: z.record(z.any()).optional()
  },
  async ({ url, query, custom_schema }: { url: string, query: string, custom_schema?: Record<string, any> }): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        'https://api.fridaydata.tech/extract',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url, query, custom_schema }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Initialize Google
server.tool(
  "initialize_google",
  "Initialize Google search capabilities",
  {},
  async () => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/initialize-google',
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Google search
server.tool(
  "google_search",
  "Performs a Google search and extracts SERP (Search Engine Results Page) data",
  {
    query: z.string(),
    location: z.string().default("US"),
    num_results: z.number().int().positive().default(15)
  },
  async ({ query, location, num_results }: { query: string, location: string, num_results: number }): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        'https://api.fridaydata.tech/search',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ query, location, num_results }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Create API key (admin)
server.tool(
  "create_api_key",
  "Creates a new API key (admin only)",
  {
    client: z.string(),
    rate_limit: z.number().int().nonnegative(),
    key_type: z.string(),
    description: z.string()
  },
  async ({ client, rate_limit, key_type, description }: { client: string, rate_limit: number, key_type: string, description: string }): Promise<any> => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/admin/create-api-key',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ client, rate_limit, key_type, description })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Revoke API key (admin)
server.tool(
  "revoke_api_key",
  "Revokes an existing API key (admin only)",
  {
    key: z.string()
  },
  async ({ key }: { key: string }): Promise<any> => {
    try {
      const response = await fetch(
        `https://api.fridaydata.tech/admin/revoke-api-key/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Get server status
server.tool(
  "get_status",
  "Gets the current status of the server",
  {},
  async () => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/status',
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Reset rate limits (admin)
server.tool(
  "reset_rate_limits",
  "Resets rate limits for all API keys (admin only)",
  {},
  async () => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/admin/reset',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Create user API key
server.tool(
  "create_user_api_key",
  "Creates an API key for an authenticated user with specified subscription plan",
  {
    key_type: z.string().describe("Subscription plan type: basic, pro, business, enterprise, or free_trial"),
    authorization: z.string()
  },
  async ({ key_type, authorization }: { key_type: string, authorization: string }): Promise<any> => {
    try {
      const response = await fetch(
        `https://api.fridaydata.tech/user/create-api-key?key_type=${encodeURIComponent(key_type)}`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Authorization': authorization,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Get user API keys
server.tool(
  "get_user_api_keys",
  "Gets all API keys for the authenticated user",
  {
    authorization: z.string()
  },
  async ({ authorization }: { authorization: string }): Promise<any> => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/user/api-keys',
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Authorization': authorization,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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

// Get subscription plans
server.tool(
  "get_subscription_plans",
  "Gets information about available subscription plans",
  {},
  async () => {
    try {
      const response = await fetch(
        'https://api.fridaydata.tech/subscription-plans',
        {
          headers: {
            'X-API-KEY': process.env.FRIDAY_API_KEY || '',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: unknown) {
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