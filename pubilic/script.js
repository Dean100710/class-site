const API_BASE = '';

async function loadData() {
    await loadMessages();
    await loadCapsules();
    await loadNotices();
    await loadStats();
    updateCountdown();
}

async function loadMessages() {
    try {
        const res = await fetch(`${API_BASE}/api/messages`);
        const result = await res.json();
        if (result.success) {
            const msgList = document.getElementById('msgList');
            if (result.data.length === 0) {
                msgList.innerHTML = '<div class="loading">暂无留言，抢个沙发吧~</div>';
                return;
            }
            msgList.innerHTML = result.data.map(msg => `
                <div class="msg-item">
                    <span class="msg-name">${escapeHtml(msg.name)}</span>
                    <span style="font-size:0.7rem; color:#789;"> ${escapeHtml(msg.time)}</span>
                    <div class="msg-text">${escapeHtml(msg.content)}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('加载留言失败:', err);
    }
}

async function postMessage(name, content) {
    try {
        const res = await fetch(`${API_BASE}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
        const result = await res.json();
        if (result.success) {
            await loadMessages();
            return true;
        } else {
            alert(result.error || '发布失败');
            return false;
        }
    } catch (err) {
        alert('网络错误，请稍后重试');
        return false;
    }
}

async function loadCapsules() {
    try {
        const res = await fetch(`${API_BASE}/api/capsules`);
        const result = await res.json();
        if (result.success) {
            const capsuleList = document.getElementById('capsuleList');
            if (result.data.length === 0) {
                capsuleList.innerHTML = '<div class="loading">暂无时光胶囊，写一封吧~</div>';
                return;
            }
            capsuleList.innerHTML = result.data.slice(0, 5).map(cap => `
                <div style="padding: 8px 0; border-bottom: 1px dashed #e2dccd;">
                    <strong>${escapeHtml(cap.name)}</strong>
                    <span style="font-size:0.7rem; color:#888;"> ${new Date(cap.created_at).toLocaleDateString()}</span>
                    <div style="font-size:0.8rem; margin-top: 4px;">💌 ${escapeHtml(cap.content.substring(0, 80))}${cap.content.length > 80 ? '...' : ''}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('加载胶囊失败:', err);
    }
}

async function saveCapsule(name, content) {
    try {
        const res = await fetch(`${API_BASE}/api/capsules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
        const result = await res.json();
        if (result.success) {
            await loadCapsules();
            return true;
        } else {
            alert(result.error || '保存失败');
            return false;
        }
    } catch (err) {
        alert('网络错误');
        return false;
    }
}

async function loadNotices() {
    try {
        const res = await fetch(`${API_BASE}/api/notices`);
        const result = await res.json();
        if (result.success) {
            const noticesDiv = document.getElementById('noticesList');
            if (result.data.length === 0) {
                noticesDiv.innerHTML = '<div class="loading">暂无公告</div>';
                return;
            }
            noticesDiv.innerHTML = `
                <ul class="notice-list">
                    ${result.data.map(n => `
                        <li>
                            <span class="date">${escapeHtml(n.date)}</span>
                            <span class="tag">${escapeHtml(n.tag || '公告')}</span>
                            <span>${escapeHtml(n.title)}${n.content ? ' - ' + escapeHtml(n.content.substring(0, 40)) : ''}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        }
    } catch (err) {
        console.error('加载公告失败:', err);
    }
}

async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/api/stats`);
        const result = await res.json();
        if (result.success) {
            const statsDiv = document.getElementById('statsInfo');
            statsDiv.innerHTML = `📅 考勤助手 | ${escapeHtml(result.data.dutyGroup)}<br>💬 已有 ${result.data.messageCount} 条留言 · ${result.data.capsuleCount} 个时光胶囊`;
            document.getElementById('fundAmount').innerText = `￥${result.data.classFund} 元`;
        }
    } catch (err) {
        console.error('加载统计失败:', err);
    }
}

function loadStudentList() {
    const students = [
        { name: '陈雨桐', avatar: '🐱', skill: 'Python/吉他' },
        { name: '林一舟', avatar: '🐧', skill: '前端/摄影' },
        { name: '张思敏', avatar: '🍃', skill: '数学竞赛' },
        { name: '李昱城', avatar: '⚡', skill: '篮球/演讲' },
        { name: '王诗语', avatar: '🌸', skill: '文学/绘画' },
        { name: '赵子轩', avatar: '🚀', skill: '物理/编程' }
    ];
    const container = document.getElementById('studentList');
    container.innerHTML = students.map(s => `
        <div class="student-card">
            <div class="avatar">${s.avatar}</div>
            <h4>${s.name}</h4>
            <div class="skill">${s.skill}</div>
        </div>
    `).join('');
}

function updateCountdown() {
    const today = new Date();
    const examDate = new Date(today.getFullYear(), 5, 25);
    if (today > examDate) examDate.setFullYear(examDate.getFullYear() + 1);
    const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    document.getElementById('examDays').innerText = diffDays;
    document.getElementById('countdownTimer').innerHTML = `⏳ 距离期末还有 ${diffDays} 天 · 一起加油 💪`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadStudentList();
    loadData();

    document.getElementById('postMsgBtn').addEventListener('click', async () => {
        const name = document.getElementById('msgUser').value;
        const content = document.getElementById('msgContent').value;
        if (!content.trim()) {
            alert('请输入留言内容');
            return;
        }
        await postMessage(name, content);
        document.getElementById('msgContent').value = '';
    });

    document.getElementById('sendCapsuleBtn').addEventListener('click', async () => {
        const name = document.getElementById('capsuleName').value;
        const content = document.getElementById('capsuleMsg').value;
        if (!content.trim()) {
            alert('请写下你想说的话');
            return;
        }
        const success = await saveCapsule(name, content);
        if (success) {
            const feedback = document.getElementById('capsuleFeedback');
            feedback.innerHTML = '✨ 时光胶囊已封存，未来会与全班一起回顾 ✨';
            document.getElementById('capsuleMsg').value = '';
            setTimeout(() => { feedback.innerHTML = ''; }, 3000);
        }
    });
});
