

const authButtons = document.getElementById('auth-buttons');

function updateAuthButtons() {
  const isLoggedIn = document.cookie.includes('userNo=');

  if (isLoggedIn) {
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.classList.add('auth-button'); // Add class "auth-button"
    logoutButton.addEventListener('click', () => {
      // Implement logout functionality 
    });
    authButtons.innerHTML = '';
    authButtons.appendChild(logoutButton);
  } else {
    const loginButton = document.createElement('a');
    loginButton.href = '/signin.html';
    loginButton.textContent = 'Login';
    loginButton.classList.add('auth-button'); // Add class "auth-button"
    authButtons.innerHTML = '';
    authButtons.appendChild(loginButton);
  }
}

updateAuthButtons();