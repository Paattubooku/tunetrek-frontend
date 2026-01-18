export const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');

    let icon = '';
    let textColor = 'text-primary';

    if (type === 'success') {
        icon = 'check_circle';
        textColor = 'text-green-500';
    } else if (type === 'error') {
        icon = 'error_outline';
        textColor = 'text-red-500';
    } else if (type === 'info') {
        icon = 'info';
        textColor = 'text-blue-500';
    } else if (type === 'favorite') {
        icon = 'favorite';
        textColor = 'text-red-500';
    } else if (type === 'unfavorite') {
        icon = 'favorite_border';
        textColor = 'text-slate-400'; // or red-500 depending on preference
    }

    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
    toast.innerHTML = `<span class="material-icons-round ${textColor} text-xl">${icon}</span> <span class="text-sm font-bold tracking-wide">${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out', 'slide-out-to-bottom-4');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};
