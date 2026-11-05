// NGexport Checklist Verifier — Cloudflare Worker proxy
// Secrets (wrangler secret put …): GEMINI_API_KEY, SHEETS_SCRIPT_URL, SHEETS_TOKEN
//   POST /     → Gemini 2.5 Flash generateContent
//   POST /log  → Apps Script audit log (token injected here, never sent to the browser)

const ALLOWED_ORIGIN = 'https://explorer420-dev.github.io';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    if (request.headers.get('Origin') !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    const path = new URL(request.url).pathname;

    if (path === '/log') {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      payload.token = env.SHEETS_TOKEN;

      // Apps Script answers POST with a redirect to the output; follow it
      const upstream = await fetch(env.SHEETS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const body = await request.text();
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const upstream = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
