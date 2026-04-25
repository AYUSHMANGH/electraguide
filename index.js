import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve the built Vite/React app from the dist folder
app.use(express.static(join(__dirname, 'dist')));

// For any route not matched by static files, serve index.html
// This is required for React Router (client-side routing) to work
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ElectraGuide server running on port ${PORT}`);
});
