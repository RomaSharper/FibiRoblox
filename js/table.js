const table = document.getElementById('placesTable');
const spinner = document.getElementById('spinner');

let starsMeta = new Map();

const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

let activeTarget = null;
let tooltipTimeout = null;

function initTooltips() {
    document.addEventListener('mouseover', (e) => {
        if (!(e.target instanceof Element)) return;

        const cell = e.target.closest('.stars-cell');
        if (!cell) return;

        if (activeTarget === cell) return;

        const stars = cell.querySelector('.stars[data-tooltip]');
        if (!stars) return;

        const text = stars.dataset.tooltip;
        if (!text) return;

        activeTarget = cell;

        tooltipTimeout = setTimeout(() => {
            tooltip.textContent = text;
            tooltip.classList.add('show');
            positionTooltip(cell, e.clientX);
        }, 200);
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeTarget) return;
        positionTooltip(activeTarget, e.clientX);
    });

    document.addEventListener('mouseout', (e) => {
        if (!(e.target instanceof Element)) return;

        const cell = e.target.closest('.stars-cell');
        if (!cell || cell !== activeTarget) return;

        if (cell.contains(e.relatedTarget)) return;

        clearTimeout(tooltipTimeout);
        tooltip.classList.remove('show');
        activeTarget = null;
    });
}

function positionTooltip(cell, mouseX) {
    const rect = cell.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 8;

    let x = mouseX - tooltipRect.width / 2;

    x = Math.max(
        padding,
        Math.min(x, window.innerWidth - tooltipRect.width - padding)
    );

    const y = rect.top - tooltipRect.height;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

export async function loadStarsMeta() {
    const res = await fetch('data/stars.json');
    const data = await res.json();

    data.forEach(item => {
        starsMeta.set(item.count, item.comment);
    });
}

export async function loadTable() {
    spinner.classList.remove('hidden');

    const res = await fetch('data/places.json');
    const places = await res.json();

    const fragment = document.createDocumentFragment();

    places.forEach((place, index) => {
        fragment.appendChild(createRow(place, index + 1));
    });

    initTooltips();
    table.appendChild(fragment);
    spinner.classList.add('hidden');
}

function createRow(place, index) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
    <td>${index}</td>
    <td class="place-name" data-url="${place.url}">
      ${place.name}
    </td>
    <td class="stars-cell">
      ${renderStars(place.rating)}
    </td>
  `;

    return tr;
}

function renderStars(count) {
    const comment = starsMeta.get(count) ?? '';

    return `
      <span
        class="stars"
        data-tooltip="${comment}"
        data-rating="${count}"
      >
        ${Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-${i < count ? 'solid' : 'regular'} fa-star star${i < count ? ' filled' : ''}"></i>`
    ).join('')}
      </span>
    `;
}
