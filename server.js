const express = require('express');
const path = require('path');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

initDatabase();

app.get('/api/messages', (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50').all();
    res.json({ success: true, data: messages });
});

app.post('/api/messages', (req, res) => {
    const { name, content } = req.body;
    if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, error: '内容不能为空' });
    }
    const displayName = name && name.trim() ? name.trim().substring(0, 20) : '匿名同学';
    const now = new Date();
    const timeStr = `${now.getMonth()+1}/${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const insert = db.prepare('INSERT INTO messages (name, content, time) VALUES (?, ?, ?)');
    const result = insert.run(displayName, content.substring(0, 500), timeStr);
    res.json({ success: true, id: result.lastInsertRowid });
});

app.get('/api/capsules', (req, res) => {
    const capsules = db.prepare('SELECT * FROM capsules ORDER BY created_at DESC LIMIT 30').all();
    res.json({ success: true, data: capsules });
});

app.post('/api/capsules', (req, res) => {
    const { name, content } = req.body;
    if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, error: '内容不能为空' });
    }
    const displayName = name && name.trim() ? name.trim().substring(0, 20) : '匿名同学';
    const insert = db.prepare('INSERT INTO capsules (name, content) VALUES (?, ?)');
    const result = insert.run(displayName, content.substring(0, 1000));
    res.json({ success: true, id: result.lastInsertRowid });
});

app.get('/api/notices', (req, res) => {
    const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 10').all();
    res.json({ success: true, data: notices });
});

app.get('/api/stats', (req, res) => {
    const messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    const capsuleCount = db.prepare('SELECT COUNT(*) as count FROM capsules').get();
    res.json({
        success: true,
        data: {
            messageCount: messageCount.count,
            capsuleCount: capsuleCount.count,
            classFund: 1247.5,
            dutyGroup: '第二组 (组长：陈雨桐)'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
