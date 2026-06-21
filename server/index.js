const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
// Hugging Face Spaces requires listening on port 7860
const PORT = process.env.PORT || 7860;

// Enable JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '7.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files if they exist
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  console.log('Serving static files from dist directory');
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('Dist directory not found, serving fallback page');
  // Fallback page if dist is missing
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quantum Studio - قيد الإنشاء</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          h1 { color: #38bdf8; }
          .card {
            background-color: #1e293b;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            max-width: 500px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Quantum Studio v7.0</h1>
          <h2>الخادم يعمل بنجاح!</h2>
          <p>مجلد واجهة المستخدم (dist) غير متوفر حالياً.</p>
          <p>يرجى بناء المشروع باستخدام <code>npm run build</code></p>
        </div>
      </body>
      </html>
    `);
  });
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Quantum Studio Server running on http://0.0.0.0:${PORT}`);
});
