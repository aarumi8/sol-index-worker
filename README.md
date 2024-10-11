# Sol Index Worker

## Description

Sol Index Worker is a Cloudflare Worker that manages and updates token and index prices for a Solana-based index tracking system. It integrates with Supabase for data storage and retrieval, and uses the Jupiter API to fetch current token prices.

## Features

- Fetches and updates token prices from the Jupiter API
- Calculates and updates index prices based on constituent tokens
- Creates historical price records for each index
- Runs automatically every 5 minutes using Cloudflare's cron triggers

## Prerequisites

- Node.js and npm installed
- A Cloudflare account
- A Supabase project set up with the appropriate schema
- Wrangler CLI installed (`npm install -g wrangler`)

## Project Structure

```
sol-index-worker/
├── src/
│   └── index.ts
├── package.json
└── wrangler.toml
```

## Setup

1. Clone the repository:
   ```
   git clone
   cd sol-index-worker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   - In the Cloudflare dashboard, go to your worker and add the following environment variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your Supabase project's anon/public key
    
   - For local development, add .dev.vars file and include your ENV variables there just like you'd do in a usual .env file

4. Configure `wrangler.toml`:
   - Ensure your `wrangler.toml` file is correctly set up with your account ID and worker name.

## Deployment

To deploy the worker:

1. Login to your Cloudflare account (if not already logged in):
   ```
   wrangler login
   ```

2. Deploy the worker:
   ```
   wrangler deploy
   ```

## Running Locally

To run the worker locally for testing:

1. Start the local development server:
   ```
   wrangler dev
   ```

2. The worker will be available at `http://localhost:8787`

## Cron Job

The worker is configured to run every 5 minutes. You can modify this in the `wrangler.toml` file:

```toml
[triggers]
crons = ["*/5 * * * *"]  # Runs every 5 minutes
```

## Troubleshooting

If you encounter issues with the cron job not running at the expected interval:

1. List current cron jobs:
   ```
   wrangler cron list
   ```

2. Delete existing cron jobs if necessary:
   ```
   wrangler cron delete "*/5 * * * *"
   ```

3. Redeploy the worker:
   ```
   wrangler deploy
   ```
