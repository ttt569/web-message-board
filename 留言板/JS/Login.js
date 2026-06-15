// 获取登录表单及相关DOM元素
const LoginForm = document.getElementById('loginForm');
const Phone = document.getElementById('phone');
const PhoneError = document.getElementById('phoneError');
const Password = document.getElementById('password');
const PasswordError = document.getElementById('passwordError');

// 清除所有错误提示
function clearErrors() {
    PhoneError.textContent = '';
    PasswordError.textContent = '';
}

// 校验手机号:正则表达式校验手机号格式
function checkphone(phoneValue){
    if(!phoneValue.trim()){
        PhoneError.textContent = '请输入手机号';
        return false;
    }
    if(!/^1[3-9]\d{9}$/.test(phoneValue)){
        PhoneError.textContent = '手机号错误';
        return false;
    }
    return true;
}

// 校验密码:非空
function checkPassword(passwordValue){
    if(!passwordValue.trim()){
        PasswordError.textContent = '请输入密码';
        return false;
    }
    return true;
}

// 验证登录：从localStorage中查找用户，匹配手机号和密码
function validateLogin(phoneValue, passwordValue){
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phoneValue);

    // 用户不存在
    if(!user){
        PhoneError.textContent = '该手机号未注册';
        return false;
    }
    // 密码不匹配
    if(user.password !== passwordValue){
        PasswordError.textContent = '密码错误';
        return false;
    }
     return user;
}

// 监听表单提交事件
LoginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    clearErrors(); 

    const phoneValue = Phone.value.trim();
    const passwordValue = Password.value;

    // 依次校验手机号和密码格式
    const isPhoneValid = checkphone(phoneValue);
    const isPasswordValid = checkPassword(passwordValue);

    // 格式校验通过后，验证登录信息
    if(isPhoneValid && isPasswordValid){
        const user = validateLogin(phoneValue, passwordValue);
        if(user){
            // 登录成功，将用户信息存入localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', user.username);
            alert('登录成功！\n用户名：' + user.username);
            LoginForm.reset();
            setTimeout(() => {
                window.location.href = '../Html/Message.html';
            }, 500);
        }
    }
});

// 手机号输入框失焦时校验
Phone.addEventListener('blur', function() {
    clearErrors();
    checkphone(this.value);
});

// 密码输入框失焦时校验
Password.addEventListener('blur', function() {
    clearErrors();
    checkPassword(this.value);
});