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

                // Check if this is a bookmark list or manual list
                if (list.isBookmarkList && list.bookmarkFolderId) {
                    // Set the list type to bookmark
                    listBox.querySelector('.list-type-manual').checked = false;
                    listBox.querySelector('.list-type-bookmark').checked = true;
                    // Trigger change to update UI
                    listBox.querySelector('.list-type-bookmark').dispatchEvent(new Event('change'));
                    // Set the selected bookmark folder after dropdown is populated
                    setTimeout(() => {
                        listBox.querySelector('.bookmark-folder-select').value = list.bookmarkFolderId;
                    }, 100);
                } else {
                    // Join the URLs in the textareas by a newline for manual lists
                    listBox.querySelector('.url-list.form-control').value = list.urlList.join('\n');
                }

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

        // Create header container for list name and delete button
        const listHeader = document.createElement('div');
        listHeader.classList.add('list-header');
        listHeader.style.display = 'flex';
        listHeader.style.justifyContent = 'space-between';
        listHeader.style.alignItems = 'center';
        listHeader.style.gap = '10px';
        listHeader.style.marginBottom = '10px';

        // Create input for the list name
        const listName = document.createElement('input');
        listName.type = 'text';
        listName.classList.add('list-name', 'form-control');
        listName.placeholder = 'List Name';
        listName.style.flex = '1';

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this list?')) {
                listBox.parentNode.removeChild(listBox);
            }
        });

        // Add list name and delete button to header
        listHeader.appendChild(listName);
        listHeader.appendChild(deleteButton);

        // Create list type selector container
        const typeContainer = document.createElement('div');
        typeContainer.classList.add('list-type-container', 'mb-2');
        typeContainer.style.display = 'flex';
        typeContainer.style.gap = '15px';
        typeContainer.style.marginTop = '10px';

        // Manual URLs radio button
        const manualRadio = document.createElement('input');
        manualRadio.type = 'radio';
        manualRadio.name = `listType_${Date.now()}_${Math.random()}`;
        manualRadio.classList.add('list-type-manual', 'form-check-input');
        manualRadio.id = `manual_${Date.now()}_${Math.random()}`;
        manualRadio.checked = true;

        const manualLabel = document.createElement('label');
        manualLabel.textContent = 'Manual URLs';
        manualLabel.htmlFor = manualRadio.id;
        manualLabel.style.marginRight = '15px';

        // Bookmark folder radio button
        const bookmarkRadio = document.createElement('input');
        bookmarkRadio.type = 'radio';
        bookmarkRadio.name = manualRadio.name;
        bookmarkRadio.classList.add('list-type-bookmark', 'form-check-input');
        bookmarkRadio.id = `bookmark_${Date.now()}_${Math.random()}`;

        const bookmarkLabel = document.createElement('label');
        bookmarkLabel.textContent = 'Bookmark Folder';
        bookmarkLabel.htmlFor = bookmarkRadio.id;

        typeContainer.appendChild(manualRadio);
        typeContainer.appendChild(manualLabel);
        typeContainer.appendChild(bookmarkRadio);
        typeContainer.appendChild(bookmarkLabel);

        // Create input for the list textarea where URLs will be entered
        const urlList = document.createElement('textarea');
        urlList.classList.add('url-list', 'form-control');
        urlList.placeholder = 'Enter URLs (one per line)';

        // Create bookmark folder dropdown (hidden by default)
        const bookmarkSelect = document.createElement('select');
        bookmarkSelect.classList.add('bookmark-folder-select', 'form-control');
        bookmarkSelect.style.display = 'none';

        // Populate bookmark folders
        populateBookmarkFolders(bookmarkSelect);

        // Add event listeners to toggle between manual and bookmark mode
        manualRadio.addEventListener('change', () => {
            if (manualRadio.checked) {
                urlList.style.display = 'block';
                bookmarkSelect.style.display = 'none';
            }
        });

        bookmarkRadio.addEventListener('change', () => {
            if (bookmarkRadio.checked) {
                urlList.style.display = 'none';
                bookmarkSelect.style.display = 'block';
            }
        });

        listBox.appendChild(listHeader);
        listBox.appendChild(typeContainer);
        listBox.appendChild(urlList);
        listBox.appendChild(bookmarkSelect);

        return listBox;
    }

    // Function to populate bookmark folders in a dropdown
    function populateBookmarkFolders(selectElement) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            // Clear existing options
            selectElement.innerHTML = '<option value="">Select a bookmark folder...</option>';

            // Recursive function to traverse bookmark tree and find folders
            function traverseBookmarks(nodes, depth = 0) {
                nodes.forEach(node => {
                    // Only add folders (nodes without url property)
                    if (!node.url && node.title) {
                        const option = document.createElement('option');
                        option.value = node.id;
                        // Add indentation based on depth for visual hierarchy
                        option.textContent = '\u00A0\u00A0'.repeat(depth) + node.title;
                        selectElement.appendChild(option);
                    }

                    // Recursively traverse children
                    if (node.children) {
                        traverseBookmarks(node.children, depth + 1);
                    }
                });
            }

            traverseBookmarks(bookmarkTreeNodes);
        });
    }

    // Add a new list box when the "Add New List" button is clicked
    addListButton.addEventListener('click', () => {
        const newListBox = createListBox();
        listContainer.appendChild(newListBox);
    });

    // Save the lists to Chrome storage when the "Save Lists" button is clicked
    saveButton.addEventListener('click', () => {
        // First, load existing lists from storage to preserve their index values
        chrome.storage.sync.get("userLists", (data) => {
            const existingLists = data.userLists || [];
            // Create a map of existing lists by name for quick lookup
            const existingListsMap = new Map();
            existingLists.forEach(list => {
                existingListsMap.set(list.listName, list);
            });

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

                // Check which list type is selected
                const isBookmarkList = listBox.querySelector('.list-type-bookmark').checked;

                let urlList = [];
                let bookmarkFolderId = null;

                if (isBookmarkList) {
                    // Get the selected bookmark folder ID
                    bookmarkFolderId = listBox.querySelector('.bookmark-folder-select').value;
                } else {
                    // Capture the URLs, splitting by newlines and checking if any are empty values
                    urlList = listBox.getElementsByClassName('url-list')[0].value
                        .split('\n')
                        .map(url => url.trim())
                        .filter(url => url !== ''); // Filter out empty URLs
                }

                // Check for duplicate list names
                if (listNames.has(listName)) {
                    hasDuplicates = true;
                    // Exit the loop if a duplicate is found
                    break;
                }
                listNames.add(listName);

                // Add to listData if the listName is not empty and:
                // - For manual lists: always save (even if empty)
                // - For bookmark lists: must have a bookmark folder selected
                if (listName) {
                    // Try to find the existing list to preserve its index
                    const existingList = existingListsMap.get(listName);
                    let preservedIndex = 0;

                    if (existingList) {
                        // Preserve the index from the existing list
                        preservedIndex = existingList.index || 0;

                        // For manual lists, validate that the preserved index doesn't exceed the new list length
                        if (!isBookmarkList && urlList.length > 0 && preservedIndex >= urlList.length) {
                            // Reset to 0 if the index would be out of bounds
                            preservedIndex = 0;
                        }
                        // Note: For bookmark lists, we can't validate here since we don't have the bookmark URLs yet
                        // The background.js will handle out-of-bounds index when it loads bookmark URLs
                    }

                    if (isBookmarkList) {
                        // Bookmark lists must have a folder selected
                        if (bookmarkFolderId) {
                            const listObject = {
                                listName: listName,
                                urlList: urlList,
                                index: preservedIndex,
                                isBookmarkList: true,
                                bookmarkFolderId: bookmarkFolderId
                            };
                            listData.push(listObject);
                        }
                        // If bookmark list has no folder, don't save it (but keep in DOM)
                    } else {
                        // Manual lists are saved even if empty
                        const listObject = {
                            listName: listName,
                            urlList: urlList,
                            index: preservedIndex
                        };
                        listData.push(listObject);
                    }
                } else if (!listName && !urlList.length && !bookmarkFolderId) {
                    // Remove completely empty list boxes from the DOM
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