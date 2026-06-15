//获取相关元素
const loginText = document.getElementById('loginText');
const loginBtn = document.getElementById('loginBtn');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn'); 
const messageList = document.getElementById('messageList'); 
// 模板元素，用于克隆生成留言卡片和评论项
const cardTemplate = document.getElementById('message-card-template');
const commentTemplate = document.getElementById('comment-item-template');

//HTML 转义，防止 XSS 攻击
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// ==================== 登录状态管理 ====================

//检查并更新登录状态显示，从 localStorage 读取登录信息
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('username');
    if (isLoggedIn === 'true' && currentUsername) {
        loginText.textContent = '欢迎，' + currentUsername;
        loginBtn.textContent = '退出';
    } else {
        loginText.textContent = '未登录';
        loginBtn.textContent = '登录';
    }
}
//用户退出登录，清除 localStorage 中的登录信息，刷新页面状态
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    checkLoginStatus();
    loadMessages();
}
// 校验登录状态和输入内容，将新留言存入 localStorage
function submitMessage() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('username');
    if (isLoggedIn !== 'true' || !currentUsername) {
        alert('请先登录！');
        window.location.href = '../Html/Login.html';
        return;
    }
    const content = messageInput.value.trim();
    if (!content) {
        alert('留言内容不能为空！');
        return;
    }
    // 从 localStorage 读取现有留言，将新留言插入到数组头部
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.unshift({
        id: Date.now(),                
        username: currentUsername,
        content: content,
        time: new Date().toLocaleString('zh-CN'),
        likes: [],                         
        comments: []                       
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    messageInput.value = '';
    loadMessages();
}

// 根据留言 ID 查找对应的 DOM 卡片元素
function findMessageCard(msgId) {
    return messageList.querySelector('.message-card[data-msg-id="' + msgId + '"]');
}
//构建单条评论的 DOM 元素
function buildCommentElement(c) {
    // 克隆评论模板并填充数据
    const fragment = commentTemplate.content.cloneNode(true);
    const wrapper = fragment.querySelector('.comment-item-wrapper');
    wrapper.dataset.commentId = c.id;

    fragment.querySelector('.comment-user').textContent = c.username;
    fragment.querySelector('.comment-text').textContent = c.content;
    fragment.querySelector('.comment-time').textContent = c.time;
    return fragment;
}
//加载并渲染所有留言，从 localStorage 读取留言数据
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const currentUsername = localStorage.getItem('username');
    messageList.innerHTML = '';

    if (messages.length === 0) {
        const p = document.createElement('p');
        p.className = 'no-message';
        p.textContent = '暂无留言';
        messageList.appendChild(p);
        return;
    }
    messages.forEach(msg => {
        const likes = msg.likes || [];
        const comments = msg.comments || [];
        const isLiked = currentUsername && likes.includes(currentUsername);
        // 克隆留言卡片模板并绑定数据
        const fragment = cardTemplate.content.cloneNode(true);
        const card = fragment.querySelector('.message-card');
        card.dataset.msgId = msg.id;

        fragment.querySelector('.message-username').textContent = msg.username;
        fragment.querySelector('.message-time').textContent = msg.time;
        fragment.querySelector('.message-content').textContent = msg.content;
        // 如果当前用户是留言作者，显示删除按钮
        if (msg.username === currentUsername) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.textContent = '删除';
            fragment.querySelector('.message-header').appendChild(deleteBtn);
        }
        // 设置点赞按钮状态（已点赞/未点赞）
        const likeBtn = fragment.querySelector('.like-btn');
        if (isLiked) likeBtn.classList.add('liked');
        fragment.querySelector('.heart').textContent = isLiked ? '❤️' : '🤍';
        fragment.querySelector('.like-count').textContent = likes.length > 0 ? likes.length : '';
        // 设置评论按钮文本（含评论数量）
        fragment.querySelector('.comment-toggle-btn').textContent = '💬 评论' + (comments.length > 0 ? ' (' + comments.length + ')' : '');
        // 渲染该留言下的所有评论
        const commentList = fragment.querySelector('.comment-list');
        comments.forEach(c => {
            commentList.appendChild(buildCommentElement(c));
        });
        messageList.appendChild(fragment);
    });
}
//删除指定留言，从 localStorage 中移除该留言并刷新列表
function deleteMessage(id) {
    if (!confirm('确定要删除这条留言吗？')) return;
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    localStorage.setItem('messages', JSON.stringify(messages.filter(msg => msg.id !== id)));
    loadMessages();
}
//切换点赞状态
function toggleLike(id) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('username');
    if (isLoggedIn !== 'true' || !currentUsername) {
        alert('请先登录！');
        return;
    }

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    if (!msg.likes) msg.likes = [];

    const idx = msg.likes.indexOf(currentUsername);
    if (idx === -1) {
        msg.likes.push(currentUsername);
    } else {
        msg.likes.splice(idx, 1);
    }
    localStorage.setItem('messages', JSON.stringify(messages));
    loadMessages();
}
//切换评论区的显示/隐藏状态
function toggleCommentSection(msgId) {
    const card = findMessageCard(msgId);
    if (card) {
        const section = card.querySelector('.comment-section');
        if (section) section.classList.toggle('active');
    }
}
//添加评论，校验登录状态和输入内容，将评论追加到对应留言的评论列表中
function addComment(msgId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('username');
    if (isLoggedIn !== 'true' || !currentUsername) {
        alert('请先登录！');
        return;
    }

    const card = findMessageCard(msgId);
    if (!card) return;
    const input = card.querySelector('.comment-input-area input');
    const content = input.value.trim();
    if (!content) {
        alert('评论内容不能为空！');
        return;
    }

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    if (!msg.comments) msg.comments = [];

    msg.comments.push({
        id: Date.now(),
        username: currentUsername,
        content: content,
        time: new Date().toLocaleString('zh-CN')
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    loadMessages();
    setTimeout(() => {
        const newCard = findMessageCard(msgId);
        if (newCard) {
            const section = newCard.querySelector('.comment-section');
            if (section) section.classList.add('active');
        }
    }, 0);
}

//留言列表的点击事件委托
messageList.addEventListener('click', function(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const card = actionEl.closest('.message-card');
    const msgId = card ? Number(card.dataset.msgId) : null;
    // 根据操作类型分发到对应的处理函数
    switch (action) {
        case 'delete': deleteMessage(msgId); break;               // 删除留言
        case 'like': toggleLike(msgId); break;                    // 点赞/取消点赞
        case 'toggle-comment': toggleCommentSection(msgId); break; // 展开/收起评论区
        case 'add-comment': addComment(msgId); break;             // 提交评论
    }
});

//留言列表的键盘事件委托
messageList.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const action = e.target.dataset.action;
    if (!action) return;
    e.preventDefault();
    const card = e.target.closest('.message-card');
    const msgId = card ? Number(card.dataset.msgId) : null;
    if (action === 'comment-keydown') {
        addComment(msgId);
    }
});
//登录/退出按钮点击事件
loginBtn.addEventListener('click', function() {
    if (this.textContent === '退出') {
        handleLogout();
    } else {
        window.location.href = '../Html/Login.html';
    }
});
submitBtn.addEventListener('click', submitMessage);
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadMessages();
});