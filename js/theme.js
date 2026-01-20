const toggle = document.getElementById('themeToggle');
const body = document.body;

export function initTheme() {
    const saved = localStorage.getItem('darkTheme');
    if (saved === '1') body.classList.add('black');

    toggle.onclick = () => {
        body.classList.toggle('black');
        localStorage.setItem(
            'darkTheme',
            body.classList.contains('black') ? '1' : '0'
        );
    };
}
