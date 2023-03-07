const url = document.getElementById('url');

const btn = document.getElementById('download');

btn.addEventListener('click', () => {
    let data = url.value;
    console.log(data);
    window.Bridge.dataUrl(data);
    console.log('clicked');

});

window.Bridge.update((callback) => {
    console.log(callback);
});