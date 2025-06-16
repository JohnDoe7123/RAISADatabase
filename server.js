const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const FILES_DIR = path.join(__dirname, 'files');
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

app.use(express.static('public'));
app.use(express.json());

// Get all files
app.get('/api/files', (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) return res.status(500).json([]);
    Promise.all(files.map(name =>
      fs.promises.readFile(path.join(FILES_DIR, name), 'utf8').then(content => JSON.parse(content))
    )).then(data => res.json(data));
  });
});

// Save or update a file
app.post('/api/files/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename);
  fs.writeFile(path.join(FILES_DIR, safeName), JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Error writing file');
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
