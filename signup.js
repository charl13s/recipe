const form = document.getElementById('registrationForm');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fullName = document.getElementById('full-name').value;
  const email = document.getElementById('your-email').value;
  const phoneNo = document.getElementById('your-phone').value;
  const password = document.getElementById('password').value;

  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fullName, email, phoneNo, password })
  })
  .then(response => {
    if (response.ok) {
    
      window.location.href = '/signin.html?message=Account created successfully!'; 
    } else {
      alert('Error creating account. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred. Please try again later.');
  });
});