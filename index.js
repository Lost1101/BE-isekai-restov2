const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;
const secretKey = 'your_secret_key';

app.use(cors({
  origin: 'http://localhost:3000', // Ganti dengan alamat frontend Anda
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Success connect');
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using https
}));

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
      const user = await prisma.user.create({
          data: { username, email, password: hashedPassword },
      });
      req.session.user = { id: user.id, username: user.username };
      res.json(user);
  } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/test-user', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'your_username' },
    });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ error: 'Could not log out' });
      }
      res.status(200).json({ message: 'Logout successful' });
  });
});

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

app.get('/menu', async (req, res) => {
  try {
    const menus = await prisma.menu.findMany();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, harga, waktu, desc } = req.body;
  try {
    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: { nama, harga, waktu, desc },
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

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

app.post('/checkout', async (req, res) => {
  const { orderItems, totalCash } = req.body;
  
  if (!orderItems || orderItems.length === 0 || totalCash == null) {
      return res.status(400).json({ message: 'Invalid order data' });
  }

  try {
      const createdOrder = await prisma.order.create({
          data: {
              totalCash,
              items: {
                  create: orderItems.map(item => ({
                      menuId: item.id,
                      nama: item.nama,
                      harga: item.harga,
                      jumlah: item.jml
                  }))
              }
          }
      });

      res.status(200).json({ message: 'Order successful', order: createdOrder });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Order failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});