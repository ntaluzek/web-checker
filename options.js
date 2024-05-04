document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveUrls').addEventListener('click', () => {
        const urlList = document.getElementById('urlList').value;
        const urls = urlList.split(',').map(url => url.trim());

        // Save the URLs to local storage
        chrome.storage.sync.set({ 'urls': urls }, () => {
            console.log('URLs saved:', urls);
        });
    });
});
