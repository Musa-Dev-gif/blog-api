const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Blog API is running! 🎉" });
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { username, email, password: hashed }
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: "Username or email taken" });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(400).json({ error: "No user" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Wrong password" });
  res.json({ message: "Login ok", userId: user.id });
});

app.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ include: { author: true } });
  res.json(posts);
});

app.post('/posts', async (req, res) => {
  const { title, content, authorId } = req.body;
  const post = await prisma.post.create({
    data: { title, content, authorId: Number(authorId) }
  });
  res.json(post);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));