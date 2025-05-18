async function fetchData() {
    const imgElement = document.getElementById("pokemonSprite");
    const pokemonNameInput = document.getElementById("pokemonName");
    const pokemonDetails = document.getElementById("pokemonDetails");
    const pokemonName = pokemonNameInput.value.toLowerCase();
  
    try {
      imgElement.style.display = "none";
      imgElement.alt = "Loading...";
      pokemonDetails.innerHTML = "";
  
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      if (!response.ok) throw new Error("Pokémon not found.");
  
      const data = await response.json();
  
      const pokemonSprite = data.sprites.front_default;
      const height = data.height;
      const weight = data.weight;
      const types = data.types.map(t => t.type.name).join(", ");
      const moves = data.moves.slice(0, 5).map(m => m.move.name).join(", ");
  
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();
  
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();
  
      const evolutions = [];
      let currentEvolution = evolutionData.chain;
      do {
        evolutions.push(currentEvolution.species.name);
        currentEvolution = currentEvolution.evolves_to[0];
      } while (currentEvolution);
  
      imgElement.src = pokemonSprite;
      imgElement.alt = `Sprite of ${pokemonName}`;
      imgElement.style.display = "block";
      pokemonNameInput.value = "";
  
      pokemonDetails.innerHTML = `
        <p><strong>Name:</strong> ${pokemonName}</p>
        <p><strong>Height:</strong> ${height} dm</p>
        <p><strong>Weight:</strong> ${weight} hg</p>
        <p><strong>Type:</strong> ${types}</p>
        <p><strong>Moves:</strong> ${moves}</p>
        <p><strong>Evolutions:</strong> ${evolutions.join(" → ")}</p>
      `;
    } catch (error) {
      console.error("Fetch error:", error);
      imgElement.alt = "Error loading Pokémon sprite.";
      pokemonDetails.innerHTML = `<p style="color: red;">Error: Unable to fetch Pokémon details.</p>`;
    }
  }
  