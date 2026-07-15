const fs = require('fs');
const path = require('path');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const DATA_FILE = path.join(__dirname, 'wishes-data.json');

function readLocal() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function writeLocal(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function getStoreInstance() {
  const isLocal = !process.env.NETLIFY || !process.env.SITE_ID;
  if (isLocal) return null;

  const { getStore } = require('@netlify/blobs');
  return getStore({ name: 'wishes', siteID: process.env.SITE_ID });
}

async function readWishes(store) {
  if (!store) return readLocal();

  try {
    const data = await store.get('all-wishes', { type: 'json' });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeWishes(store, data) {
  if (!store) {
    writeLocal(data);
    return;
  }
  await store.set('all-wishes', JSON.stringify(data));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    const store = await getStoreInstance();

    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const page = parseInt(params.get('page') || '1', 10);
      const limit = parseInt(params.get('limit') || '6', 10);

      const allWishes = await readWishes(store);
      const totalWishes = allWishes.length;
      const totalPages = Math.max(1, Math.ceil(totalWishes / limit));
      const startIndex = (page - 1) * limit;
      const pageWishes = allWishes.slice(startIndex, startIndex + limit);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
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
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, message } = body;

      if (!name || !message) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Name and message are required' }),
        };
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

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ wish: newWish }),
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
