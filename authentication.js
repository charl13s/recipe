const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');

function updateAuthButtons() {
  const isLoggedIn = document.cookie.includes('userNo=');

  if (isLoggedIn) {
    logoutButton.style.display = 'block';
    loginButton.style.display = 'none';

    logoutButton.addEventListener('click', () => {
      fetch('/logout', {
        method: 'POST'
      })
      .then(response => {
        if (response.ok) {
          updateAuthButtons();
        } else {
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
    });
  } else {
    logoutButton.style.display = 'none';
    loginButton.style.display = 'block';
  }
}

updateAuthButtons();