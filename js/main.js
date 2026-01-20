import { initTheme } from './theme.js';
import { initModal } from './modal.js';
import { initTooltips } from './tooltip.js';
import { loadTable, loadStarsMeta } from './table.js';

(async () => {
    initTheme();
    initModal();
    await loadStarsMeta();
    await loadTable();
    initTooltips();
})();
