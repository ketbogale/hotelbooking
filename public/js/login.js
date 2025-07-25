// Load configuration
// Make sure config.js is loaded before this file in your HTML

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  errorMsg.className = 'error-message'; // Reset style
  errorMsg.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Simple validation
  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    errorMsg.className = 'error-message active error';
    setTimeout(() => {
      errorMsg.className = 'error-message';
      errorMsg.textContent = '';
    }, 2000);
    return;
  }
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailPattern.test(email)) {
    errorMsg.textContent = 'Please enter a valid email address.';
    errorMsg.className = 'error-message active error';
    setTimeout(() => {
      errorMsg.className = 'error-message';
      errorMsg.textContent = '';
    }, 2000);
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.success && result.token) {
      localStorage.setItem('token', result.token);
      // Fetch user profile after login to get name and email
      fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + result.token }
      })
      .then(res => res.json())
      .then(user => {
        if (user && user.email) {
          localStorage.setItem('user', JSON.stringify({
            name: (user.firstName ? user.firstName + ' ' : '') + (user.lastName || ''),
            email: user.email
          }));
        }
        // Redirect to intended page or home
        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirect;
        } else {
          window.location.href = 'index.html';
        }
      });
    } else {
      errorMsg.textContent = 'Invalid email or password.';
      errorMsg.className = 'error-message active error';
      setTimeout(() => {
        errorMsg.className = 'error-message';
        errorMsg.textContent = '';
      }, 2000);
    }
  } catch (err) {
    errorMsg.textContent = 'Something went wrong. Please try again.';
    errorMsg.className = 'error-message active error';
    setTimeout(() => {
      errorMsg.className = 'error-message';
      errorMsg.textContent = '';
    }, 2000);
  }
});

// Forgot Password Modal Logic
const forgotLink = document.getElementById('forgotPasswordLink');
const forgotModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const sendResetBtn = document.getElementById('sendResetBtn');
const forgotEmail = document.getElementById('forgotEmail');
const forgotMsg = document.getElementById('forgotMsg');

forgotLink.addEventListener('click', function(e) {
  e.preventDefault();
  forgotModal.style.display = 'flex';
  forgotEmail.value = '';
  forgotMsg.textContent = '';
  forgotMsg.className = 'error-message';
});

closeForgotModal.addEventListener('click', function() {
  forgotModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
  if (e.target === forgotModal) forgotModal.style.display = 'none';
});

function showForgotMsg(message, isSuccess) {
  forgotMsg.textContent = message;
  forgotMsg.className = 'error-message active ' + (isSuccess ? 'success' : 'error');
  setTimeout(() => {
    forgotMsg.className = 'error-message';
    forgotMsg.textContent = '';
  }, 2000);
}

sendResetBtn.addEventListener('click', async function() {
  const email = forgotEmail.value.trim();
  if (!email) {
    showForgotMsg('Please enter your email address.', false);
    return;
  }
  // Send request to backend
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    showForgotMsg(data.message || 'If this email is registered, you will receive password reset instructions.', true);
  } catch (err) {
    showForgotMsg('Something went wrong. Please try again.', false);
  }
});