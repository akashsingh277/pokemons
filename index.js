async function fetchData() {
  const imgElement = document.getElementById("pokemonSprite");
  const pokemonNameInput = document.getElementById("pokemonName");
  const pokemonDetails = document.getElementById("pokemonDetails");
  const pokemonName = pokemonNameInput.value.toLowerCase();

  try {
    imgElement.style.display = "none"; // Hide the image while loading
    imgElement.alt = "Loading..."; // Show loading text
    pokemonDetails.innerHTML = ""; // Clear previous details

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    const pokemonSprite = data.sprites.front_default;
    const height = data.height;
    const weight = data.weight;
    const types = data.types.map(typeInfo => typeInfo.type.name).join(", ");
    const moves = data.moves.slice(0, 5).map(moveInfo => moveInfo.move.name).join(", "); // Limit to 5 moves

    imgElement.src = pokemonSprite;
    imgElement.alt = `Sprite of ${pokemonName}`;
    imgElement.style.display = "block"; // Show the image element
    pokemonNameInput.value = ""; // Clear the input field

    // Populate Pokémon details
    pokemonDetails.innerHTML = `
      <p><strong>Name:</strong> ${pokemonName}</p>
      <p><strong>Height:</strong> ${height} decimetres</p>
      <p><strong>Weight:</strong> ${weight} hectograms</p>
      <p><strong>Type:</strong> ${types}</p>
      <p><strong>Moves:</strong> ${moves}</p>
    `;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    imgElement.alt = "Error loading Pokémon sprite.";
    pokemonDetails.innerHTML = `<p style="color: red;">Error: Unable to fetch Pokémon details.</p>`;
  }
}

