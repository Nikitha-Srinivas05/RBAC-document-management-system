require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedRoles = require('./config/seedRoles');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
// Day 2+ will add: /api/documents, /api/permissions, /api/audit

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedRoles();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
