const pokemonNameInput = document.getElementById('pokemonName');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const menuBtn = document.getElementById('menuBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const themeBtn = document.getElementById('themeBtn');
const sortBtn = document.getElementById('sortBtn');
const typeFilter = document.getElementById('typeFilter');
const searchSuggestions = document.getElementById('searchSuggestions');
const searchBox = document.querySelector('.search-box');
const pokemonSprite = document.getElementById('pokemonSprite');
const pokemonTitle = document.getElementById('pokemonTitle');
const descriptionEl = document.getElementById('description');
const typesDiv = document.getElementById('types');
const heightEl = document.getElementById('height');
const weightEl = document.getElementById('weight');
const abilitiesEl = document.getElementById('abilities');
const detailControls = document.getElementById('detailControls');
const favoriteToggle = document.getElementById('favoriteToggle');
const shinyToggle = document.getElementById('shinyToggle');
const infoSummary = document.getElementById('infoSummary');
const statsContainer = document.getElementById('statsContainer');
const statsDiv = document.getElementById('stats');
const evolutionsContainer = document.getElementById('evolutionsContainer');
const evolutionsDiv = document.getElementById('evolutions');
const moreInfo = document.getElementById('moreInfo');
const loader = document.getElementById('loader');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenuBtn = document.getElementById('closeMenu');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const pokemonGrid = document.getElementById('pokemonGrid');
const favoritesSection = document.querySelector('.favorites-section');
const favoritesList = document.getElementById('favoritesList');
const compareToggleBtn = document.getElementById('compareToggle');
const comparePanel = document.getElementById('comparePanel');
const compareList = document.getElementById('compareList');
const compareGrid = document.getElementById('compareGrid');
const clearCompareBtn = document.getElementById('clearCompare');

const API_BASE = 'https://pokeapi.co/api/v2';
let currentPokemon = null;
let currentSpecies = null;
let currentEvolutions = [];
let dexPokemon = [];
let alphaPokemon = [];
let currentList = [];
let currentType = '';
let sortOrder = 'alpha';
let currentPage = 1;
const pageSize = 50;
let totalPages = 1;
let favorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
let compareSlots = [];
const typeCache = {};

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function setLoading(isLoading) {
  if (!loader) return;
  loader.style.display = isLoading ? 'block' : 'none';
}

function hideElement(element) {
  if (!element) return;
  element.classList.add('hidden');
}

function showElement(element) {
  if (!element) return;
  element.classList.remove('hidden');
}

function saveFavorites() {
  localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

function isFavorite(name) {
  return favorites.includes(name);
}

function addFavorite(name) {
  if (!name || isFavorite(name)) return;
  favorites.push(name);
  saveFavorites();
  renderFavorites();
  updateFavoriteButton();
}

function removeFavorite(name) {
  favorites = favorites.filter(fav => fav !== name);
  saveFavorites();
  renderFavorites();
  updateFavoriteButton();
}

function toggleFavorite() {
  if (!currentPokemon) return;
  const name = currentPokemon.name;
  if (isFavorite(name)) {
    removeFavorite(name);
  } else {
    addFavorite(name);
  }
}

function renderFavorites() {
  if (!favoritesSection || !favoritesList) return;

  if (favorites.length === 0) {
    favoritesSection.classList.add('hidden');
    favoritesList.innerHTML = '<p style="color:#ccc;">No favorites yet.</p>';
    return;
  }

  favoritesSection.classList.remove('hidden');
  favoritesList.innerHTML = '';

  favorites.forEach(name => {
    const item = document.createElement('div');
    item.className = 'favorites-item';
    item.innerHTML = `<span>${capitalize(name)}</span>`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    openBtn.addEventListener('click', () => {
      pokemonNameInput.value = name;
      fetchPokemon();
      toggleMenu(false);
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeFavorite(name));

    actions.append(openBtn, removeBtn);
    item.appendChild(actions);
    favoritesList.appendChild(item);
  });
}

function updateFavoriteButton() {
  if (!detailControls || !favoriteToggle) return;
  if (!currentPokemon) {
    hideElement(detailControls);
    return;
  }

  showElement(detailControls);
  favoriteToggle.textContent = isFavorite(currentPokemon.name)
    ? 'Remove Favorite'
    : 'Add to Favorites';
}

function updateCompareButton() {
  if (!compareToggleBtn || !currentPokemon) return;
  const existingIndex = compareSlots.indexOf(currentPokemon.name);
  compareToggleBtn.textContent = existingIndex !== -1
    ? 'Remove from Compare'
    : 'Add to Compare';
}

function updateComparePanel() {
  if (!comparePanel || !compareList || !compareGrid) return;
  if (!compareSlots.length) {
    hideElement(comparePanel);
    return;
  }

  showElement(comparePanel);
  compareList.innerHTML = compareSlots.map(name => `<span class="compare-item">${capitalize(name)}</span>`).join('');
  renderCompareGrid();
}

async function renderCompareGrid() {
  if (!compareGrid) return;
  compareGrid.innerHTML = '';
  const compareData = [];

  for (const name of compareSlots) {
    try {
      const response = await fetch(`${API_BASE}/pokemon/${name}`);
      if (!response.ok) continue;
      compareData.push(await response.json());
    } catch (error) {
      console.error('Error fetching compare Pokemon:', error);
    }
  }

  compareData.forEach(data => {
    const card = document.createElement('div');
    card.className = 'compare-card';
    card.innerHTML = `
      <img src="${data.sprites.front_default || ''}" alt="${data.name}" />
      <h4>${capitalize(data.name)}</h4>
      <p><strong>Type:</strong> ${data.types.map(t => capitalize(t.type.name)).join(', ')}</p>
      <p><strong>HP:</strong> ${data.stats.find(s => s.stat.name === 'hp')?.base_stat || 'N/A'}</p>
      <p><strong>Attack:</strong> ${data.stats.find(s => s.stat.name === 'attack')?.base_stat || 'N/A'}</p>
      <p><strong>Defense:</strong> ${data.stats.find(s => s.stat.name === 'defense')?.base_stat || 'N/A'}</p>
      <p><strong>Speed:</strong> ${data.stats.find(s => s.stat.name === 'speed')?.base_stat || 'N/A'}</p>
    `;
    compareGrid.appendChild(card);
  });
}

function toggleCompareSlot() {
  if (!currentPokemon) return;
  const name = currentPokemon.name;
  const existingIndex = compareSlots.indexOf(name);

  if (existingIndex !== -1) {
    compareSlots.splice(existingIndex, 1);
  } else {
    if (compareSlots.length >= 2) {
      compareSlots.shift();
    }
    compareSlots.push(name);
  }

  updateCompareButton();
  updateComparePanel();
}

function clearCompare() {
  compareSlots = [];
  updateCompareButton();
  updateComparePanel();
}

function updateThemeButton() {
  if (!themeBtn) return;
  const isLight = document.body.classList.contains('light');
  themeBtn.textContent = isLight ? '🌙 Dark' : '🌙 Light';
}

function setTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
  localStorage.setItem('pokemonTheme', theme);
  updateThemeButton();
}

function loadSavedTheme() {
  const saved = localStorage.getItem('pokemonTheme');
  if (saved === 'light') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}

function updateSortButtonText() {
  if (!sortBtn) return;
  sortBtn.textContent = sortOrder === 'alpha' ? 'Sort: A→Z' : 'Sort: Pokédex';
}

function sortPokemonAlphabetically(list) {
  return list.slice().sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchAllPokemon() {
  try {
    const response = await fetch(`${API_BASE}/pokemon?limit=10000`);
    const data = await response.json();
    dexPokemon = data.results || [];
    alphaPokemon = sortPokemonAlphabetically(dexPokemon);
    applyListSettings();
    renderSearchSuggestions();
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
  }
}

async function loadTypeOptions() {
  try {
    const response = await fetch(`${API_BASE}/type`);
    const data = await response.json();
    const types = (data.results || []).filter(type => type.name !== 'shadow' && type.name !== 'unknown');
    if (!typeFilter) return;

    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = capitalize(type.name);
      typeFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading type options:', error);
  }
}

function buildListFromType(typeData, sorted) {
  const list = (typeData || []).map(item => item.pokemon ? item.pokemon : item);
  return sorted ? sortPokemonAlphabetically(list) : list;
}

async function fetchTypeList(type) {
  if (!type) return sortOrder === 'alpha' ? alphaPokemon : dexPokemon;
  if (typeCache[type]) return typeCache[type];

  try {
    const response = await fetch(`${API_BASE}/type/${type}`);
    const data = await response.json();
    const list = buildListFromType(data.pokemon, sortOrder === 'alpha');
    typeCache[type] = list;
    return list;
  } catch (error) {
    console.error('Error fetching type list:', error);
    return [];
  }
}

async function applyListSettings() {
  if (currentType) {
    const filtered = await fetchTypeList(currentType);
    currentList = filtered;
  } else {
    currentList = sortOrder === 'alpha' ? alphaPokemon : dexPokemon;
  }

  totalPages = Math.max(Math.ceil(currentList.length / pageSize), 1);
  currentPage = Math.min(currentPage, totalPages);
  renderPokemonList();
}

function renderPokemonList() {
  if (!pokemonGrid) return;
  pokemonGrid.innerHTML = '';

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = currentList.slice(startIndex, startIndex + pageSize);

  pageItems.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-grid-card';
    card.innerHTML = `<h3>${capitalize(pokemon.name)}</h3>`;
    card.addEventListener('click', () => {
      pokemonNameInput.value = pokemon.name;
      fetchPokemon();
      toggleMenu(false);
    });
    pokemonGrid.appendChild(card);
  });

  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

function toggleMenu(open) {
  if (!menuOverlay) return;
  menuOverlay.classList.toggle('open', open);
  menuOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function buildConditionText(detail) {
  if (!detail) return 'No special condition';
  const parts = [];
  if (detail.trigger && detail.trigger.name) {
    const trigger = detail.trigger.name.replace('-', ' ');
    if (trigger === 'level up' && detail.min_level) {
      parts.push(`at level ${detail.min_level}`);
    } else if (trigger === 'use item' && detail.item) {
      parts.push(`using ${detail.item.name.replace('-', ' ')}`);
    } else if (trigger === 'trade') {
      parts.push('when traded');
    } else {
      parts.push(trigger);
    }
  }
  if (detail.gender !== null && detail.gender !== undefined) {
    parts.push(detail.gender === 1 ? 'female' : 'male');
  }
  if (detail.location) {
    parts.push(`at ${detail.location.name}`);
  }
  return parts.join(', ') || 'No special condition';
}

function getEvolutionChainItems(chain) {
  const items = [];
  function traverse(node) {
    const detail = node.evolution_details && node.evolution_details[0] ? node.evolution_details[0] : null;
    items.push({
      name: node.species.name,
      condition: detail ? buildConditionText(detail) : 'Base form',
    });
    node.evolves_to.forEach(next => traverse(next));
  }
  traverse(chain);
  return items;
}

async function fetchPokemon() {
  const query = pokemonNameInput.value.trim().toLowerCase();
  if (!query) {
    pokemonTitle.textContent = 'Please enter a Pokémon name or ID.';
    return;
  }

  clearPokemonInfo();
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/pokemon/${query}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const data = await response.json();
    currentPokemon = data;

    const speciesResponse = await fetch(data.species.url);
    currentSpecies = await speciesResponse.json();

    const evolutionResponse = await fetch(currentSpecies.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    currentEvolutions = getEvolutionChainItems(evolutionData.chain);

    renderPokemonDetails(data, currentSpecies, currentEvolutions);
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    pokemonTitle.textContent = 'Error: Pokémon not found.';
  } finally {
    setLoading(false);
  }
}

function renderPokemonDetails(data, speciesData, evolutionItems) {
  pokemonTitle.textContent = capitalize(data.name);
  descriptionEl.textContent = (speciesData.flavor_text_entries || [])
    .find(entry => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || 'No description available.';

  const types = data.types.map(type => `<span class="type ${type.type.name}">${type.type.name}</span>`).join(' ');
  typesDiv.innerHTML = types;
  heightEl.textContent = `Height: ${data.height / 10} m`;
  weightEl.textContent = `Weight: ${data.weight / 10} kg`;
  abilitiesEl.innerHTML = `<strong>Abilities:</strong> ${data.abilities.map(item => capitalize(item.ability.name)).join(', ')}`;

  infoSummary.innerHTML = `<p><strong>Base experience:</strong> ${data.base_experience}</p>`;
  showElement(infoSummary);

  renderStats(data.stats);
  renderEvolutions(evolutionItems);
  renderMoreInfo(data, speciesData);

  pokemonSprite.src = data.sprites.front_default || '';
  pokemonSprite.alt = `Sprite of ${capitalize(data.name)}`;
  if (data.sprites.front_default) {
    pokemonSprite.style.display = 'block';
  }

  if (shinyToggle) {
    shinyToggle.classList.remove('hidden');
    shinyToggle.textContent = 'Show Shiny';
  }

  updateFavoriteButton();
  updateCompareButton();
  updateComparePanel();
  renderFavorites();
}

function renderStats(stats) {
  if (!statsContainer || !statsDiv) return;
  statsDiv.innerHTML = '';
  stats.forEach(stat => {
    const statValue = stat.base_stat;
    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    statRow.innerHTML = `
      <div class="stat-label">${capitalize(stat.stat.name)}</div>
      <div class="stat-bar-wrapper">
        <div class="stat-bar" style="width:${Math.min(100, (statValue / 255) * 100)}%"></div>
      </div>
      <div class="stat-value">${statValue}</div>
    `;
    statsDiv.appendChild(statRow);
  });
  showElement(statsContainer);
}

function renderEvolutions(items) {
  if (!evolutionsContainer || !evolutionsDiv) return;
  evolutionsDiv.innerHTML = '';
  items.forEach(async item => {
    const evoCard = document.createElement('div');
    evoCard.className = 'pokemon-grid-card';
    evoCard.innerHTML = `<h4>${capitalize(item.name)}</h4><p>${item.condition}</p>`;
    evolutionsDiv.appendChild(evoCard);
    try {
      const evoResponse = await fetch(`${API_BASE}/pokemon/${item.name}`);
      if (!evoResponse.ok) return;
      const evoData = await evoResponse.json();
      const evoImg = document.createElement('img');
      evoImg.src = evoData.sprites.front_default || '';
      evoImg.alt = item.name;
      evoImg.style.width = '80px';
      evoImg.style.height = '80px';
      evoImg.style.display = 'block';
      evoImg.style.margin = '8px auto';
      evoCard.prepend(evoImg);
    } catch (error) {
      console.error('Error loading evolution sprite:', error);
    }
  });
  showElement(evolutionsContainer);
}

function renderMoreInfo(data, speciesData) {
  if (!moreInfo) return;
  const moveNames = data.moves.slice(0, 8).map(move => capitalize(move.move.name)).join(', ') || 'None';
  const eggGroups = (speciesData.egg_groups || []).map(group => capitalize(group.name)).join(', ') || 'None';
  const color = speciesData.color?.name ? capitalize(speciesData.color.name) : 'Unknown';

  moreInfo.innerHTML = `
    <div class="more-info">
      <p><strong>Moves:</strong> ${moveNames}</p>
      <p><strong>Egg groups:</strong> ${eggGroups}</p>
      <p><strong>Color:</strong> ${color}</p>
    </div>
  `;
  showElement(moreInfo);
}

function clearPokemonInfo() {
  pokemonTitle.textContent = '';
  descriptionEl.textContent = '';
  typesDiv.innerHTML = '';
  heightEl.textContent = '';
  weightEl.textContent = '';
  abilitiesEl.innerHTML = '';
  infoSummary.innerHTML = '';
  statsDiv.innerHTML = '';
  evolutionsDiv.innerHTML = '';
  if (moreInfo) {
    moreInfo.innerHTML = '';
  }
  currentPokemon = null;
  if (statsContainer) hideElement(statsContainer);
  if (evolutionsContainer) hideElement(evolutionsContainer);
  if (detailControls) hideElement(detailControls);
  if (infoSummary) hideElement(infoSummary);
  if (moreInfo) hideElement(moreInfo);
  if (searchSuggestions) hideElement(searchSuggestions);
}

function renderSearchSuggestions() {
  if (!searchSuggestions || !pokemonNameInput) return;
  const query = pokemonNameInput.value.trim().toLowerCase();
  if (!query || !alphaPokemon.length) {
    hideElement(searchSuggestions);
    return;
  }

  const matches = alphaPokemon.filter(pokemon => pokemon.name.includes(query)).slice(0, 8);
  if (!matches.length) {
    hideElement(searchSuggestions);
    return;
  }

  searchSuggestions.innerHTML = '';
  matches.forEach(match => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = capitalize(match.name);
    item.addEventListener('click', () => {
      pokemonNameInput.value = match.name;
      hideElement(searchSuggestions);
      fetchPokemon();
    });
    searchSuggestions.appendChild(item);
  });

  showElement(searchSuggestions);
}

function toggleSprite() {
  if (!currentPokemon || !shinyToggle || !pokemonSprite) return;
  const shiny = shinyToggle.dataset.shiny === 'true';
  const nextShiny = !shiny;
  shinyToggle.dataset.shiny = String(nextShiny);
  if (nextShiny && currentPokemon.sprites.front_shiny) {
    pokemonSprite.src = currentPokemon.sprites.front_shiny;
    shinyToggle.textContent = 'Show Normal';
  } else {
    pokemonSprite.src = currentPokemon.sprites.front_default || '';
    shinyToggle.textContent = 'Show Shiny';
  }
}

function showFavoritesPanel() {
  toggleMenu(true);
  if (favoritesSection) favoritesSection.classList.remove('hidden');
  renderFavorites();
}

async function handleTypeChange() {
  currentType = typeFilter?.value || '';
  currentPage = 1;
  await applyListSettings();
}

async function handleSortToggle() {
  sortOrder = sortOrder === 'alpha' ? 'dex' : 'alpha';
  updateSortButtonText();
  currentPage = 1;
  await applyListSettings();
}

function handleSearchInput() {
  renderSearchSuggestions();
}

function handleDocumentClick(event) {
  if (searchBox && !searchBox.contains(event.target)) {
    hideElement(searchSuggestions);
  }
}

function randomPokemon() {
  const id = Math.floor(Math.random() * 1025) + 1;
  pokemonNameInput.value = String(id);
  fetchPokemon();
}

function initEventListeners() {
  if (searchBtn) searchBtn.addEventListener('click', fetchPokemon);
  if (randomBtn) randomBtn.addEventListener('click', randomPokemon);
  if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
  if (favoritesBtn) favoritesBtn.addEventListener('click', showFavoritesPanel);
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(document.body.classList.contains('light') ? 'dark' : 'light'));
  if (sortBtn) sortBtn.addEventListener('click', handleSortToggle);
  if (typeFilter) typeFilter.addEventListener('change', handleTypeChange);
  if (favoriteToggle) favoriteToggle.addEventListener('click', toggleFavorite);
  if (shinyToggle) shinyToggle.addEventListener('click', toggleSprite);
  if (compareToggleBtn) compareToggleBtn.addEventListener('click', toggleCompareSlot);
  if (clearCompareBtn) clearCompareBtn.addEventListener('click', clearCompare);
  if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderPokemonList();
    }
  });
  if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderPokemonList();
    }
  });
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => toggleMenu(false));
  if (menuOverlay) {
    menuOverlay.addEventListener('click', event => {
      if (event.target === menuOverlay) toggleMenu(false);
    });
  }
  if (pokemonNameInput) {
    pokemonNameInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') fetchPokemon();
    });
    pokemonNameInput.addEventListener('input', handleSearchInput);
  }
  document.addEventListener('click', handleDocumentClick);
}

function initializeLayout() {
  updateSortButtonText();
  loadSavedTheme();
  updateThemeButton();
  renderFavorites();
}

async function init() {
  initEventListeners();
  initializeLayout();
  await Promise.all([fetchAllPokemon(), loadTypeOptions()]);
  await applyListSettings();
}

init();
