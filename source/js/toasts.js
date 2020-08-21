

const drawToast = (status, msg, dur = 1000) => {
    let title = document.getElementById('mainTitle');
    let color;
    if (status == 'ok') {
        color = 'is-success';
    } else {
        color = 'is-danger';
    }
    let toast = document.createElement('div');
    toast.className = `notification ${color}`;
    toast.innerText = msg;

    title.parentNode.insertBefore(toast, title);
    setTimeout(() => {
        title.parentNode.removeChild(title.previousSibling);
    }, dur);
}

//referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);

export { drawToast }