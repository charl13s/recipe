const recipesContainer = document.getElementById('recipes-container');
const searchButton = document.getElementById('search-button');
const recipeIdInput = document.getElementById('recipe-id-search');

function displayRecipe(recipe) {
  // Create a link for the recipe card
  const recipeLink = document.createElement('a');
  recipeLink.href = `/displayrecipe.html?id=${recipe.Recipe_No}`;
  recipeLink.classList.add('recipe-card');

  const recipeDiv = document.createElement('div');
  recipeDiv.classList.add('recipe');

  const recipeImage = document.createElement('img');
  recipeImage.src = 'uploads/' + recipe.Image;
  recipeImage.alt = recipe.Recipe_Name + ' image';
  recipeDiv.appendChild(recipeImage);

  const recipeName = document.createElement('h3');
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

  // Append the recipeDiv to the link
  recipeLink.appendChild(recipeDiv);

  recipesContainer.appendChild(recipeLink);
}

searchButton.addEventListener('click', () => {
  const recipeId = recipeIdInput.value;

  fetch(`/recipe/${recipeId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      return response.json();
    })
    .then(recipe => {
      recipesContainer.innerHTML = '';
      displayRecipe(recipe);
    })
    .catch(error => {
      console.error('Error fetching recipe:', error);
      recipesContainer.innerHTML = '<p>Recipe not found.</p>';
    });
});

// Fetch all recipes initially
fetch('/recipes')
  .then(response => response.json())
  .then(recipes => {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
      displayRecipe(recipe);
    });
  })
  .catch(error => {
    console.error('Error fetching recipes:', error);
  });