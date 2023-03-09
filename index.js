const url = document.getElementById('url');

const btn = document.getElementById('download');

btn.addEventListener('click', () => {
    let data = url.value;
    console.log(data);
    let qualityLabel = "720p";
    console.log(qualityLabel);
    window.Bridge.dataUrl(data, qualityLabel);
    console.log('clicked');

});

window.Bridge.update((callback) => {
    console.log(callback);
});