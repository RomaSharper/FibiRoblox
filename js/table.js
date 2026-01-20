const tableBody = document.getElementById('placesTable');
const spinner = document.getElementById('spinner');
const filtersWrapper = document.getElementById('filtersWrapper');
const thead = document.querySelector('table thead');

let places = [];
let starsMeta = new Map();

const state = {
    sortKey: null,
    sortDir: 1,
    filters: {
        id: '',
        place: '',
        rating: ''
    }
};

/* =========================
   Filter Inputs
========================= */

const filterKeys = [
    { key: 'id', label: '#' },
    { key: 'place', label: 'Плейс' },
    { key: 'rating', label: 'Рейтинг' }
];

const filterInputs = {};

function setupFilters() {
    filtersWrapper.innerHTML = '';
    filterKeys.forEach(({ key, label }) => {
        const wrapper = document.createElement('div');
        wrapper.className = `filter-item ${key}`;

        const lbl = document.createElement('label');
        lbl.textContent = label;

        const input = document.createElement('input');
        input.className = 'table-filter';
        input.value = state.filters[key] || '';
        input.placeholder = 'Фильтр';
        input.addEventListener('input', () => {
            state.filters[key] = input.value.toLowerCase();
            updateQuery();
            render();
        });

        wrapper.appendChild(lbl);
        wrapper.appendChild(input);
        filtersWrapper.appendChild(wrapper);

        filterInputs[key] = input;
    });
}

/* =========================
   Deep-link
========================= */

function applyQueryFilters() {
    const params = new URLSearchParams(window.location.search);
    filterKeys.forEach(({ key }) => {
        if (params.has(key)) state.filters[key] = params.get(key).toLowerCase();
    });
}

function updateQuery() {
    const params = new URLSearchParams();
    filterKeys.forEach(({ key }) => {
        if (state.filters[key]) params.set(key, state.filters[key]);
    });
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
    history.replaceState(null, '', newUrl);
}

/* =========================
   Empty State
========================= */

const emptyRow = document.createElement('tr');
emptyRow.className = 'table-empty-row';
emptyRow.innerHTML = `
  <td colspan="3">
    <div class="table-empty-card">
      <i class="fa-solid fa-filter-circle-xmark"></i>
      <div class="table-empty-content">
        <h3>Ничего не найдено</h3>
        <p>Попробуй изменить фильтры или сбросить их</p>
      </div>
      <button class="btn cancel table-empty-reset">Сбросить фильтры</button>
    </div>
  </td>
`;

emptyRow.querySelector('.table-empty-reset').addEventListener('click', () => {
    filterKeys.forEach(({ key }) => {
        state.filters[key] = '';
        filterInputs[key].value = '';
    });
    render();
});

/* =========================
   Render
========================= */

function render() {
    tableBody.innerHTML = '';

    let rows = [...places].filter(p => {
        return (!state.filters.id || String(p.id).includes(state.filters.id)) &&
            (!state.filters.place || p.place.toLowerCase().includes(state.filters.place)) &&
            (!state.filters.rating || String(p.rating).includes(state.filters.rating));
    });

    if (state.sortKey) {
        rows.sort((a, b) => {
            const A = a[state.sortKey];
            const B = b[state.sortKey];
            return (typeof A === 'string' ? A.localeCompare(B, 'ru') : A - B) * state.sortDir;
        });
    }

    if (!rows.length) {
        tableBody.appendChild(emptyRow);
        return;
    }

    const frag = document.createDocumentFragment();
    rows.forEach(p => frag.appendChild(createRow(p, p.index)));
    tableBody.appendChild(frag);
}

function createRow(place) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${place.id}</td>
      <td class="place-name" data-url="${place.url}" data-tooltip="${place.url}">${place.place}</td>
      <td class="stars-cell">${renderStars(place.rating)}</td>
    `;
    return tr;
}

function renderStars(count) {
    const comment = starsMeta.get(count) ?? `${count} / 5`;
    return `
    <span class="stars" data-tooltip="${comment}">
      ${Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-${i < count ? 'solid' : 'regular'} fa-star"></i>`
    ).join('')}
    </span>
  `;
}

/* =========================
   Header Sorting
========================= */

function setupSorting() {
    const headerRow = thead.querySelector('tr');
    filterKeys.forEach(({ key }, i) => {
        const th = headerRow.children[i];
        th.classList.add('sortable');
        th.addEventListener('click', () => {
            state.sortDir = state.sortKey === key ? -state.sortDir : 1;
            state.sortKey = key;
            render();
        });
    });
}

/* =========================
   Public API
========================= */

export async function loadStarsMeta() {
    const res = await fetch('data/stars.json');
    const data = await res.json();
    data.forEach(i => starsMeta.set(i.count, i.comment));
}

export async function loadTable() {
    spinner.classList.remove('hidden');

    const res = await fetch('data/places.json');

    places = await res.json();
    console.log(places);

    applyQueryFilters();
    setupFilters();
    setupSorting();
    render();

    spinner.classList.add('hidden');
}
