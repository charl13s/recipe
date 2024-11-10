const form = document.getElementById('recipeForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const recipeName = document.getElementById('recipe_name').value;
    const ingredients = document.getElementById('ingredients').value;
    const procedure1 = document.getElementById('procedure1').value;
    const duration = document.getElementById('duration').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('recipe_name', recipeName);
    formData.append('ingredients', ingredients);
    formData.append('procedure1', procedure1);
    formData.append('duration', duration);
    formData.append('image', image);

    fetch('/recipe', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert('Recipe submitted!');
            form.reset();
        } else {
            alert('Error submitting recipe. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});