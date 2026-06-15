// 获取页面中的表单元素和错误提示元素
const username = document.getElementById('username');
const password = document.getElementById('password');
const phone = document.getElementById('phone');
const submitBtn = document.querySelector('button[type="submit"]');
const registerForm = document.getElementById('registerForm');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const phoneError = document.getElementById('phoneError');

// 清除所有错误提示信息
function clearErrors() {
    usernameError.textContent = '';
    passwordError.textContent = '';
    phoneError.textContent = '';
}

// 校验手机号:正则表达式校验手机号格式
function checkphone(phoneValue){
    if(!phoneValue.trim()){
        phoneError.textContent = '请输入手机号';
        return false;
    }
    if(!/^1[3-9]\d{9}$/.test(phoneValue)){
        phoneError.textContent = '手机号格式错误';
        return false;
    }
    return true;
}

// 校验用户名：正则表达式校验用户名格式
function checkname(usernameValue){
    if(!usernameValue.trim()){
        usernameError.textContent = '请输入用户名';
        return false;
    }
    if(!/^[a-zA-Z0-9_\u4e00-\u9fa5]{3,16}$/.test(usernameValue)){
        usernameError.textContent = '用户名至少3位,支持字母、数字、下划线或中文';
        return false;
    }
    return true;
}

// 校验密码:正则表达式校验密码格式
function checkpassword(passwordValue){
    if(!passwordValue){
        passwordError.textContent = '请输入密码';
        return false;
    }
    if(!/^(?=.*[a-zA-Z])(?=.*\d).{6}$/.test(passwordValue)){
        passwordError.textContent = '密码至少6位,必须包含字母和数字';
        return false;
    }
    return true;
}

// 处理注册逻辑
function handleRegister(event){
    event.preventDefault();
    clearErrors();
    // 获取输入值并去除首尾空格
    const usernameValue = username.value.trim();
    const passwordValue = password.value;
    const phoneValue = phone.value.trim();
    // 依次校验手机号、用户名、密码，任一不通过则终止注册
    if(!checkphone(phoneValue)){
        return;
    }
    if(!checkname(usernameValue)){
        return;
    }
    if(!checkpassword(passwordValue)){
        return;
    }

    // 构建用户数据对象
    const userData = {
        username: usernameValue,
        password: passwordValue,
        phone: phoneValue,
        registerTime: new Date().toISOString()
    };

    // 从 localStorage 中读取已有用户列表
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    // 检查用户名是否已被注册
    const exists = users.some(user => user.username === usernameValue);
    if(exists){
        usernameError.textContent = '用户名已存在！';
        return;
    }
    // 检查手机号是否已被注册
    const phoneExists = users.some(user => user.phone === phoneValue);
    if(phoneExists){
        phoneError.textContent = '手机号已被注册！';
        return;
    }
    // 将新用户添加到列表并保存回 localStorage
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    alert('注册成功！');
    registerForm.reset();
    setTimeout(() => {
        window.location.href = '../Html/Login.html';
    }, 1000);
}
submitBtn.addEventListener('click', handleRegister);