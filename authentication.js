const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');

function updateAuthButtons() {
  const isLoggedIn = document.cookie.includes('userNo='); 

  if (isLoggedIn) {
    logoutButton.style.display = 'block'; 
    loginButton.style.display = 'none';  
  } else {
    logoutButton.style.display = 'none';  
    loginButton.style.display = 'block'; 
  }
}

updateAuthButtons();