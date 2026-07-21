import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStore } from '@netlify/blobs';

const DATA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'wishes-data.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function readLocal() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Local read error:", e);
  }
  return [];
}

function writeLocal(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Local write error:", e);
  }
}

async function getStoreInstance() {
  const isLocal = process.env.NETLIFY_DEV === 'true' || !process.env.SITE_ID;
  if (isLocal) return null;
  return getStore({ name: 'wishes', consistency: 'strong' });
}

async function readWishes(store) {
  const isLocal = process.env.NETLIFY_DEV === 'true' || !process.env.SITE_ID;
  if (isLocal) return readLocal();

  if (!store) return [];

  try {
    const data = await store.get('all-wishes', { type: 'json' });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to read from Netlify Blobs:", e);
    return [];
  }
}

async function writeWishes(store, data) {
  const isLocal = process.env.NETLIFY_DEV === 'true' || !process.env.SITE_ID;
  if (isLocal) {
    writeLocal(data);
    return;
  }

  if (!store) {
    console.error("No store available in production to write wishes");
    return;
  }
  await store.set('all-wishes', JSON.stringify(data));
}

export default async (req, context) => {
  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders });
  }

  try {
    const store = await getStoreInstance();

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '6', 10);

      const allWishes = await readWishes(store);
      const totalWishes = allWishes.length;
      const totalPages = Math.max(1, Math.ceil(totalWishes / limit));
      const startIndex = (page - 1) * limit;
      const pageWishes = allWishes.slice(startIndex, startIndex + limit);

      return new Response(
        JSON.stringify({
          wishes: pageWishes,
          pagination: {
            page,
            limit,
            totalWishes,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
      
      const { name, message } = body;

      if (!name || !message) {
        return new Response(
          JSON.stringify({ error: 'Name and message are required' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const allWishes = await readWishes(store);

      const newWish = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: name.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      allWishes.unshift(newWish);
      await writeWishes(store, allWishes);

      return new Response(
        JSON.stringify({ wish: newWish }),
        { status: 201, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
