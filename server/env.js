// Load a local .env into process.env, if present. Uses Node's built-in loader
// (Node 20.6+/22), so there's no dotenv dependency. Imported first by server.js
// so env vars are set before any other module reads them.
try { process.loadEnvFile() } catch { /* no .env file — that's fine */ }
