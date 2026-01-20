const backdrop = document.getElementById('modalBackdrop');
const modalText = document.getElementById('modalText');
const confirmBtn = document.getElementById('modalConfirm');
const cancelBtn = document.getElementById('modalCancel');

let currentUrl = null;

export function initModal() {
    document.addEventListener('click', (e) => {
        const cell = e.target.closest('.place-name');
        if (!cell) return;

        currentUrl = cell.dataset.url;
        modalText.textContent =
            'Вы собираетесь открыть страницу плейса на Roblox. Продолжить?';

        backdrop.classList.add('show');
    });

    confirmBtn.onclick = () => {
        if (!currentUrl) return;
        window.open(currentUrl, '_blank', 'noopener,noreferrer');
        close();
    };

    cancelBtn.onclick = close;
    backdrop.onclick = (e) => e.target === backdrop && close();
    document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

function close() {
    backdrop.classList.remove('show');
    currentUrl = null;
}
