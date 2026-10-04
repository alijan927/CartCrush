document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      window.location.href = 'admin.html';
    } else {
      errorMsg.textContent = data.message || 'Invalid credentials';
    }
  } catch (err) {
    errorMsg.textContent = 'Server connection error.';
  }
});