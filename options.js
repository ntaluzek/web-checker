document.addEventListener('DOMContentLoaded', () => {
    // Get references to key elements
    const listContainer = document.getElementById('listContainer');
    const addListButton = document.getElementById('addListButton');
    const saveButton = document.getElementById('saveButton');

    // Load existing lists from Chrome storage when the options page loads
    chrome.storage.sync.get("userLists", (data) => {
        if (data.userLists) {
            // If there are existing lists, create boxes for each
            data.userLists.forEach((list) => {
                const listBox = createListBox();
                listBox.getElementsByClassName('list-name')[0].value = list.listName;
                listBox.getElementsByClassName('url-list')[0].value = list.urlList.join('\n'); // Rejoin the URLs with newline
                listContainer.appendChild(listBox);
            });
        }
        else {
            createListBox(); // Create empty list box when none have been set by user
        }
    });

    // Function to create a new list box
    function createListBox() {
        const listBox = document.createElement('div');
        listBox.className = 'list-box'; // Assign class for styling

        const listName = document.createElement('input');
        listName.type = 'text';
        listName.className = 'list-name';
        listName.placeholder = 'List Name';

        const urlList = document.createElement('textarea');
        urlList.className = 'url-list';
        urlList.placeholder = 'Enter URLs (one per line)';

        listBox.appendChild(listName);
        listBox.appendChild(urlList);

        return listBox; // Return the new list box
    }

    // Add a new list box when the "Add New List" button is clicked
    addListButton.addEventListener('click', () => {
        const newListBox = createListBox();
        listContainer.appendChild(newListBox);
    });

    // Save the lists to Chrome storage when the "Save Lists" button is clicked
    saveButton.addEventListener('click', () => {
        const listData = []; // Array to hold the list data

        // Loop through all list boxes and collect the data
        const listBoxes = document.getElementsByClassName('list-box');
        for (let i = 0; i < listBoxes.length; i++) {
            const listNames = listBoxes[i].getElementsByClassName('list-name')[0].value;
            console.log (listNames);
            const urlList = listBoxes[i].getElementsByClassName('url-list')[0].value;

            listData.push({
                listName: listNames,
                urlList: urlList.split('\n').filter((url) => url.trim() !== ''), // Split into individual URLs
                index: 0
            });
        }

        console.log(listData);
        // Save the data to Chrome storage
        chrome.storage.sync.set({ userLists: listData }, () => {
            console.log('Lists saved to Chrome storage');
        });
    });

});