const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'class.db');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new sqlite3(dbPath);

function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS capsules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL,
            tag TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    const messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    if (messageCount.count === 0) {
        const insertMsg = db.prepare('INSERT INTO messages (name, content, time) VALUES (?, ?, ?)');
        insertMsg.run('班主任-王老师', '大家复习注意休息，课件已上传资源共享区。', '2小时前');
        insertMsg.run('匿名树洞', '最近有点迷茫，有没有同学一起图书馆自习呀~', '昨天');
        insertMsg.run('李一舟', '求明天晚上的团建剧本杀报名链接！', '刚刚');
    }
    
    console.log('Database initialized');
}

module.exports = { db, initDatabase };
