const form = document.getElementById('signinForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('your-email').value;
    const password = document.getElementById('password').value;

    fetch('/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.ok) {
            alert('Sign in successful!');
            window.location.href = '/index.html'; 
        } else {
            alert('Invalid email or password.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});