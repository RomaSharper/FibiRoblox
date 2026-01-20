const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

let activeTarget = null;

export function initTooltips(selector = '[data-tooltip]') {
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(selector);
        if (!target || activeTarget === target) return;

        const content = target.dataset.tooltip;
        if (!content) return;

        activeTarget = target;
        tooltip.textContent = content;
        tooltip.classList.add('show');
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeTarget) return;
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY - 24}px`;
    });

    document.addEventListener('mouseout', (e) => {
        if (!activeTarget) return;
        if (!e.relatedTarget || !activeTarget.contains(e.relatedTarget)) {
            tooltip.classList.remove('show');
            activeTarget = null;
        }
    });
}
