const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tambah menu
app.post('/menu', async (req, res) => {
  const { nama, harga } = req.body;
  try {
    const menu = await prisma.menu.create({
      data: { nama, harga },
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Tampilkan semua menu
app.get('/menu', async (req, res) => {
  try {
    const menus = await prisma.menu.findMany();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Edit menu
app.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, harga } = req.body;
  try {
    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: { nama, harga },
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Hapus menu
app.delete('/menu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const menu = await prisma.menu.delete({
      where: { id: parseInt(id) },
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});