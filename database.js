const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'class.db');
let db = null;

async function initDatabase() {
    let SQL = await initSqlJs();
    
    // 如果数据库文件已存在，加载它
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // 创建表
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS capsules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL,
            tag TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // 检查是否有数据，没有则插入示例
    const messageCount = db.exec(`SELECT COUNT(*) as count FROM messages`);
    if (messageCount.length === 0 || messageCount[0].values[0][0] === 0) {
        db.run(`INSERT INTO messages (name, content, time) VALUES (?, ?, ?)`, ['班主任-王老师', '大家复习注意休息，课件已上传资源共享区。', '2小时前']);
        db.run(`INSERT INTO messages (name, content, time) VALUES (?, ?, ?)`, ['匿名树洞', '最近有点迷茫，有没有同学一起图书馆自习呀~', '昨天']);
        db.run(`INSERT INTO messages (name, content, time) VALUES (?, ?, ?)`, ['李一舟', '求明天晚上的团建剧本杀报名链接！', '刚刚']);
    }
    
    // 保存数据库到文件
    saveDatabase();
    console.log('✅ 数据库初始化完成');
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        if (!fs.existsSync(path.join(__dirname, 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'data'));
        }
        fs.writeFileSync(dbPath, buffer);
    }
}

function getDb() {
    return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
