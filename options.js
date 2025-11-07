document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const listContainer = document.getElementById('listContainer');
    const addListButton = document.getElementById('addListButton');
    const saveButton = document.getElementById('saveButton');
    const captureShortcutButton = document.getElementById('captureShortcutButton');
    const resetShortcutButton = document.getElementById('resetShortcutButton');
    const currentShortcutDisplay = document.getElementById('currentShortcut');
    const tooltipToggle = document.getElementById('tooltipToggle');
    const tooltipToggleLabel = document.getElementById('tooltipToggleLabel');

    // Default keyboard shortcut configuration
    const defaultShortcut = {
        alt: true,
        ctrl: false,
        shift: false,
        meta: false,
        key: 'ArrowRight'
    };

    // Load existing lists from Chrome storage when the options page loads
    chrome.storage.sync.get("userLists", (data) => {
        if (data.userLists) {
            // If there are existing lists, create boxes for each
            data.userLists.forEach((list) => {
                // First create a new list box
                const listBox = createListBox();
                // Then fill in the newly created box with the stored values
                listBox.querySelector('.list-name.form-control').value = list.listName;
                // Join the URLs in the textareas by a newline
                listBox.querySelector('.url-list.form-control').value = list.urlList.join('\n');
                // Add new listBox to the DOM inside the listContainer
                listContainer.appendChild(listBox);
            });
        }
        else {
            // Create empty list box when none have been set by user
            const emptyListBox = createListBox();
            listContainer.appendChild(emptyListBox);
        }
    });

    // Function to create a new list box
    function createListBox() {
        // Create div for the box
        const listBox = document.createElement('div');
        listBox.classList.add('list-box', 'form-control');
        // Create input for the list name
        const listName = document.createElement('input');
        listName.type = 'text';
        listName.classList.add('list-name', 'form-control');
        listName.placeholder = 'List Name';
        // Create input for the list textarea where URLs will be entered
        const urlList = document.createElement('textarea');
        urlList.classList.add('url-list', 'form-control');
        urlList.placeholder = 'Enter URLs (one per line)';

        listBox.appendChild(listName);
        listBox.appendChild(urlList);

        return listBox;
    }

    // Add a new list box when the "Add New List" button is clicked
    addListButton.addEventListener('click', () => {
        const newListBox = createListBox();
        listContainer.appendChild(newListBox);
    });

    // Save the lists to Chrome storage when the "Save Lists" button is clicked
    saveButton.addEventListener('click', () => {
        const listData = []; // Array to hold the list data
        const listNames = new Set(); // Set to track unique list names
        let hasDuplicates = false; // Flag to check for duplicates
    
        // Loop through all list boxes and collect the data
        const listBoxes = document.getElementsByClassName('list-box');
        // Iterate in reverse to avoid index issues when removing elements
        for (let i = listBoxes.length - 1; i >= 0; i--) { 
            const listBox = listBoxes[i];
            // Capture the name in the list box and trim any extra whitespace
            const listName = listBox.getElementsByClassName('list-name')[0].value.trim();
            // Capture the URLs, splitting by newlines and checking if any are empty values
            const urlList = listBox.getElementsByClassName('url-list')[0].value
                .split('\n')
                .map(url => url.trim())
                .filter(url => url !== ''); // Filter out empty URLs
    
            // Check for duplicate list names
            if (listNames.has(listName)) {
                hasDuplicates = true;
                // Exit the loop if a duplicate is found
                break;
            }
            listNames.add(listName);
    
            // Only add to listData and keep in DOM if the listName is not empty or urlList has at least one URL
            if (listName || urlList.length > 0) {
                listData.push({
                    listName: listName,
                    urlList: urlList,
                    index: 0
                });
            } else {
                // Remove empty list boxes from the DOM
                listBox.parentNode.removeChild(listBox);
            }
        }
        // Prevent saving if duplicates are found
        if (hasDuplicates) {
            alert('There are duplicate list names. Please remove duplicates before saving.');
            return;
        }
    
        // Save the non-empty data to Chrome storage
        chrome.storage.sync.set({ userLists: listData }, () => {
            if (chrome.runtime.lastError) {
                // Handle any errors that occurred during the save operation
                console.error('Error saving data:', chrome.runtime.lastError);
                alert('An error occurred while saving the lists.');
            } else {
                // Show an alert message indicating success
                alert('Your lists have been successfully saved!');
            }
        });
    });

    // ============ Keyboard Shortcut Configuration ============

    // Function to format shortcut for display
    function formatShortcut(shortcut) {
        const modifiers = [];
        if (shortcut.ctrl) modifiers.push('Ctrl');
        if (shortcut.alt) modifiers.push('Alt');
        if (shortcut.shift) modifiers.push('Shift');
        if (shortcut.meta) modifiers.push('Meta');

        // Format the key name for better readability
        let keyName = shortcut.key;
        if (keyName.startsWith('Arrow')) {
            keyName = keyName.replace('Arrow', 'Arrow ');
        }

        return modifiers.length > 0
            ? `${modifiers.join(' + ')} + ${keyName}`
            : keyName;
    }

    // Load and display current keyboard shortcut
    function loadShortcut() {
        chrome.storage.sync.get("keyboardShortcut", (data) => {
            const shortcut = data.keyboardShortcut || defaultShortcut;
            currentShortcutDisplay.textContent = formatShortcut(shortcut);
        });
    }

    // Function to update tooltip toggle label appearance
    function updateTooltipToggleLabelAppearance(isEnabled) {
        if (isEnabled) {
            tooltipToggleLabel.classList.remove('text-muted');
        } else {
            tooltipToggleLabel.classList.add('text-muted');
        }
    }

    // Load tooltip toggle setting
    function loadTooltipToggle() {
        chrome.storage.sync.get("showTooltip", (data) => {
            // Default to true (show tooltip) if not set
            const showTooltip = data.showTooltip !== undefined ? data.showTooltip : true;
            tooltipToggle.checked = showTooltip;
            updateTooltipToggleLabelAppearance(showTooltip);
        });
    }

    // Load shortcut and tooltip settings on page load
    loadShortcut();
    loadTooltipToggle();

    // Capture new keyboard shortcut
    let isCapturing = false;
    captureShortcutButton.addEventListener('click', () => {
        if (isCapturing) return;

        isCapturing = true;
        captureShortcutButton.disabled = true;
        captureShortcutButton.textContent = 'Press key combo now...';

        // Listen for the next keydown event
        const captureHandler = (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Ignore modifier-only keys
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
                return;
            }

            // Create shortcut object from the pressed keys
            const newShortcut = {
                ctrl: event.ctrlKey,
                alt: event.altKey,
                shift: event.shiftKey,
                meta: event.metaKey,
                key: event.key
            };

            // Save the new shortcut
            chrome.storage.sync.set({ keyboardShortcut: newShortcut }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving shortcut:', chrome.runtime.lastError);
                    alert('An error occurred while saving the shortcut.');
                } else {
                    // Update display
                    currentShortcutDisplay.textContent = formatShortcut(newShortcut);
                }

                // Reset capture state
                isCapturing = false;
                captureShortcutButton.disabled = false;
                captureShortcutButton.textContent = 'Change Shortcut';

                // Remove the event listener
                document.removeEventListener('keydown', captureHandler, true);
            });
        };

        // Add capture listener with capture phase to catch all events
        document.addEventListener('keydown', captureHandler, true);

        // Auto-cancel after 10 seconds of no input
        setTimeout(() => {
            if (isCapturing) {
                isCapturing = false;
                captureShortcutButton.disabled = false;
                captureShortcutButton.textContent = 'Change Shortcut';
                document.removeEventListener('keydown', captureHandler, true);
            }
        }, 10000);
    });

    // Reset to default shortcut
    resetShortcutButton.addEventListener('click', () => {
        chrome.storage.sync.set({ keyboardShortcut: defaultShortcut }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error resetting shortcut:', chrome.runtime.lastError);
                alert('An error occurred while resetting the shortcut.');
            } else {
                currentShortcutDisplay.textContent = formatShortcut(defaultShortcut);
            }
        });
    });

    // Save tooltip toggle setting when changed
    tooltipToggle.addEventListener('change', () => {
        const showTooltip = tooltipToggle.checked;
        // Update label appearance immediately
        updateTooltipToggleLabelAppearance(showTooltip);
        // Save to storage
        chrome.storage.sync.set({ showTooltip: showTooltip }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving tooltip setting:', chrome.runtime.lastError);
            } else {
                console.log('Tooltip setting saved:', showTooltip);
            }
        });
    });
});