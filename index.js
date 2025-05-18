async function fetchData() {
    const imgElement = document.getElementById("pokemonSprite");
    const loader = document.getElementById("loader");
    const pokemonNameInput = document.getElementById("pokemonName");
    const pokemonDetails = document.getElementById("pokemonDetails");
    const evolutionSprites = document.getElementById("evolutionSprites");
    const pokemonName = pokemonNameInput.value.toLowerCase();
  
    try {
      // Reset UI
      imgElement.style.display = "none";
      pokemonDetails.innerHTML = "";
      evolutionSprites.innerHTML = "";
      loader.style.display = "block";
  
      // Fetch basic Pokémon data
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
  
      // Evolution chain data
      const evolutions = [];
      let current = evolutionData.chain;
  
      while (current) {
        evolutions.push(current.species.name);
        current = current.evolves_to[0];
      }
  
      // Fetch evolution sprites
      for (const evo of evolutions) {
        const evoData = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo}`);
        const evoJson = await evoData.json();
        const evoImg = document.createElement("img");
        evoImg.src = evoJson.sprites.front_default;
        evoImg.alt = evo;
        evolutionSprites.appendChild(evoImg);
      }
  
      // Display data
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
      console.error("Error fetching data:", error);
      pokemonDetails.innerHTML = `<p style="color: red;">Error: Could not fetch Pokémon details.</p>`;
    } finally {
      loader.style.display = "none";
    }
  }
  const input = document.getElementById('pokemonName');

  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {  // Check if Enter key is pressed
      fetchData();                // Call your search function
    }
  });
  document.addEventListener('click', () => {
    const audio = document.getElementById('pokemonTheme');
    if (audio.paused) {
      audio.play();
    }
  }, { once: true });
  
    