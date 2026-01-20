const tableBody = document.getElementById('placesTable');
const spinner = document.getElementById('spinner');
const table = tableBody.closest('table');
const thead = table.querySelector('thead');

let places = [];
let starsMeta = new Map();

const state = {
    sortKey: null,
    sortDir: 1,
    filters: {
        index: '',
        name: '',
        rating: ''
    }
};

/* =========================
   Tooltip
========================= */

const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

let activeTarget = null;

function initTooltips() {
    document.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.stars-cell');
        if (!cell || activeTarget === cell) return;

        const stars = cell.querySelector('.stars');
        if (!stars || !stars.dataset.tooltip) return;

        activeTarget = cell;
        tooltip.textContent = stars.dataset.tooltip;
        tooltip.classList.add('show');
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeTarget) return;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY - 24}px`;
    });

    document.addEventListener('mouseout', () => {
        tooltip.classList.remove('show');
        activeTarget = null;
    });
}

/* =========================
   Render
========================= */

function render() {
    tableBody.innerHTML = '';

    let rows = [...places];

    rows = rows.filter(p => {
        if (state.filters.index && !String(p.index).includes(state.filters.index)) return false;
        if (state.filters.name && !p.name.toLowerCase().includes(state.filters.name)) return false;
        if (state.filters.rating && !String(p.rating).includes(state.filters.rating)) return false;
        return true;
    });

    if (state.sortKey) {
        rows.sort((a, b) => {
            const A = a[state.sortKey];
            const B = b[state.sortKey];
            return (typeof A === 'string'
                ? A.localeCompare(B, 'ru')
                : A - B) * state.sortDir;
        });
    }

    const frag = document.createDocumentFragment();
    rows.forEach((p, i) => frag.appendChild(createRow(p, p.id)));
    tableBody.appendChild(frag);
}

function createRow(place, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>${index}</td>
    <td class="place-name" data-url="${place.url}">${place.name}</td>
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
   Header UI
========================= */

function setupHeader() {
    const headerRow = thead.querySelector('tr');
    const filterRow = document.createElement('tr');

    const keys = ['index', 'name', 'rating'];

    headerRow.querySelectorAll('th').forEach((th, i) => {
        const key = keys[i];
        th.classList.add('sortable');

        th.addEventListener('click', () => {
            state.sortDir = state.sortKey === key ? -state.sortDir : 1;
            state.sortKey = key;
            render();
        });

        const input = document.createElement('input');
        input.className = 'table-filter';
        input.placeholder = 'Фильтр';

        input.addEventListener('input', () => {
            state.filters[key] = input.value.toLowerCase();
            render();
        });

        const cell = document.createElement('th');
        cell.appendChild(input);
        filterRow.appendChild(cell);
    });

    thead.appendChild(filterRow);
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
    const data = await res.json();

    places = data.map((p, i) => ({
        index: i + 1,
        ...p
    }));

    setupHeader();
    initTooltips();
    render();

    spinner.classList.add('hidden');
}
