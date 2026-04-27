const express = require('express');
const path = require('path');
const { initDatabase, getDb, saveDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// 初始化数据库
(async () => {
    await initDatabase();
    console.log('数据库已就绪');
})();

// 首页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 获取留言
app.get('/api/messages', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec(`SELECT * FROM messages ORDER BY created_at DESC LIMIT 50`);
        const messages = result.length > 0 ? result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            content: row[2],
            time: row[3],
            created_at: row[4]
        })) : [];
        res.json({ success: true, data: messages });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// 发布留言
app.post('/api/messages', (req, res) => {
    try {
        const { name, content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: '内容不能为空' });
        }
        const displayName = name && name.trim() ? name.trim().substring(0, 20) : '匿名同学';
        const now = new Date();
        const timeStr = `${now.getMonth()+1}/${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        
        const db = getDb();
        db.run(`INSERT INTO messages (name, content, time) VALUES (?, ?, ?)`, [displayName, content.substring(0, 500), timeStr]);
        saveDatabase();
        
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// 获取时光胶囊
app.get('/api/capsules', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec(`SELECT * FROM capsules ORDER BY created_at DESC LIMIT 30`);
        const capsules = result.length > 0 ? result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            content: row[2],
            created_at: row[3]
        })) : [];
        res.json({ success: true, data: capsules });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// 保存时光胶囊
app.post('/api/capsules', (req, res) => {
    try {
        const { name, content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: '内容不能为空' });
        }
        const displayName = name && name.trim() ? name.trim().substring(0, 20) : '匿名同学';
        
        const db = getDb();
        db.run(`INSERT INTO capsules (name, content) VALUES (?, ?)`, [displayName, content.substring(0, 1000)]);
        saveDatabase();
        
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// 获取公告
app.get('/api/notices', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec(`SELECT * FROM notices ORDER BY created_at DESC LIMIT 10`);
        const notices = result.length > 0 ? result[0].values.map(row => ({
            id: row[0],
            title: row[1],
            content: row[2],
            date: row[3],
            tag: row[4]
        })) : [];
        res.json({ success: true, data: notices });
    } catch (err) {
        res.json({ success: true, data: [] });
    }
});

// 获取统计
app.get('/api/stats', (req, res) => {
    try {
        const db = getDb();
        const msgResult = db.exec(`SELECT COUNT(*) as count FROM messages`);
        const capResult = db.exec(`SELECT COUNT(*) as count FROM capsules`);
        const messageCount = msgResult.length > 0 ? msgResult[0].values[0][0] : 0;
        const capsuleCount = capResult.length > 0 ? capResult[0].values[0][0] : 0;
        
        res.json({
            success: true,
            data: {
                messageCount: messageCount,
                capsuleCount: capsuleCount,
                classFund: 1247.5,
                dutyGroup: '第二组 (组长：陈雨桐)'
            }
        });
    } catch (err) {
        res.json({ success: true, data: { messageCount: 0, capsuleCount: 0, classFund: 1247.5, dutyGroup: '第二组' } });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
