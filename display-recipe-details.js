const recipeDetailsContainer = document.getElementById('recipe-details');

function getRecipeIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

const recipeId = getRecipeIdFromUrl();

if (recipeId) {
  fetch(`/recipes/${recipeId}`)
    .then(response => response.json())
    .then(recipe => {
      const recipeDiv = document.createElement('div');
      recipeDiv.classList.add('recipe-details');

      const recipeImage = document.createElement('img');
      recipeImage.src = 'uploads/' + recipe.Image;
      recipeImage.alt = recipe.Recipe_Name + ' image';
      recipeDiv.appendChild(recipeImage);

      const recipeName = document.createElement('h2');
      recipeName.textContent = recipe.Recipe_Name;
      recipeDiv.appendChild(recipeName);

      const ingredientsList = document.createElement('ul');
      recipe.Ingredients.split(',').forEach(ingredient => {
        const ingredientItem = document.createElement('li');
        ingredientItem.textContent = ingredient.trim();
        ingredientsList.appendChild(ingredientItem);
      });
      recipeDiv.appendChild(ingredientsList);

      const procedure = document.createElement('p');
      procedure.textContent = recipe.Procedure1;
      recipeDiv.appendChild(procedure);

      const duration = document.createElement('p');
      duration.textContent = 'Duration: ' + recipe.Duration;
      recipeDiv.appendChild(duration);

      recipeDetailsContainer.appendChild(recipeDiv);
    })
    .catch(error => {
      console.error('Error fetching recipe details:', error);
      recipeDetailsContainer.innerHTML = '<p>Error loading recipe details.</p>';
    });
} else {
  recipeDetailsContainer.innerHTML = '<p>Invalid recipe ID.</p>';
}