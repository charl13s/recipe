document.addEventListener('DOMContentLoaded', () => {
  const recipeDetailsContainer = document.getElementById('recipe-details');

  function getRecipeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  const recipeId = getRecipeIdFromUrl();

  if (recipeId) {
    fetch(`/recipe/${recipeId}`)
      .then(response => response.json())
      .then(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe-details');

        const recipeName = document.createElement('h1'); // Changed to h1 for main heading
        recipeName.textContent = recipe.Recipe_Name;
        recipeDiv.appendChild(recipeName);


        const recipeImage = document.createElement('img');
        recipeImage.src = 'uploads/' + recipe.Image;
        recipeImage.alt = recipe.Recipe_Name + ' image';
        recipeDiv.appendChild(recipeImage);

       
        recipeName.textContent = recipe.Recipe_Name;
        recipeDiv.appendChild(recipeName);

         // Ingredients section with title
         const ingredientsTitle = document.createElement('h4');
         ingredientsTitle.textContent = 'Ingredients:';
         recipeDiv.appendChild(ingredientsTitle);
 
         const ingredientsList = document.createElement('ul');
         recipe.Ingredients.split(',').forEach(ingredient => {
           const ingredientItem = document.createElement('li');
           ingredientItem.textContent = ingredient.trim();
           ingredientsList.appendChild(ingredientItem);
         });
         recipeDiv.appendChild(ingredientsList);

        // Procedure section with title
        const procedureTitle = document.createElement('h4');
        procedureTitle.textContent = 'Procedure:';
        recipeDiv.appendChild(procedureTitle);

        const procedure = document.createElement('p');
        procedure.textContent = recipe.Procedure1;
        recipeDiv.appendChild(procedure);

       

        // Duration section with title
        const durationTitle = document.createElement('h4');
        durationTitle.textContent = 'Duration:';
        recipeDiv.appendChild(durationTitle);

        const duration = document.createElement('p');
        duration.textContent = recipe.Duration;
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
});