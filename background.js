let selectedList;
let listIndex;
let listLength;
let mainTab;

// Listen for messages from the popup or injected content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start" || message.action === "next" || message.action === "restart") {
        sendResponse({status: 'received'});
        chrome.tabs.onUpdated.addListener(onTabUpdated);
        selectedList = message.list;
        // Start iterating through URLs
        startUrlIteration(selectedList, message.action);
    }
    else if (message.action === "close") {
        chrome.tabs.onUpdated.removeListener(onTabUpdated);
        sendResponse({status: 'close command received', success: true});
    }
});

// Listen for the onUpdated event to decide when to inject the content script
function onTabUpdated (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        chrome.storage.local.get("sessionTabId", (data) => {
            if (data.sessionTabId  === tabId) {
                injectContentScript(tabId);
            }
        })
    }
};

// Start or continue through URL iteration from specified list
function startUrlIteration(list, action) {
    // Get userLists data
    chrome.storage.sync.get("userLists", (data) => {
        let userLists = data.userLists;
        // Identify the list selected for iteration
        const userList = userLists.find(obj => obj.listName === list);

        // Function to proceed with URL iteration once we have the URL list
        function proceedWithUrls(urls) {
            // Get details about length of list and the index location
            listLength = urls.length;

            // Handle the "restart" action
            if (action === "restart") {
                userList.index = 0; // Reset the index to the beginning of the list
            }

            listIndex = userList.index;

            // Determine if the index is smaller than the length of the list to prevent
            // trying to access values outside of the list array
            if (listIndex < listLength) {
                // If the list iteration was "start"ed then create a new tab
                if (action === "start" || action === "restart") {
                    chrome.tabs.create({ url: urls[listIndex] }, (tab) => {
                        chrome.storage.local.set({ sessionTabId: tab.id });
                    });
                }
                // If the list iteration was "next" then update tab to next URL in list
                else if (action === "next") {
                    // Get information on the tab
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentTab = tabs[0];
                        // Check that current tab id matches the one used by the extension
                        if (currentTab) {
                            const targetTabId = currentTab.id;
                            // Update webpage being visited in the tab
                            chrome.tabs.update(targetTabId, { url: urls[listIndex] });
                        } else {
                            console.error("No active tab found for next injection");
                        }
                    });
                }
                // Increase index value by one to indicate passage through the URL list
                userList.index += 1;
                // If index value becomes greater or equal to length of list, then restart index to 0
                if (userList.index >= listLength) {
                    userList.index = 0;
                };
                // Update the index value in storage
                chrome.storage.sync.set({userLists: userLists});
            } else {
                console.error("List is empty or index out of bounds");
            }
        }

        // Check if this is a bookmark-based list
        if (userList.isBookmarkList && userList.bookmarkFolderId) {
            // Fetch URLs from the bookmark folder
            chrome.bookmarks.getChildren(userList.bookmarkFolderId, (bookmarks) => {
                if (chrome.runtime.lastError) {
                    console.error("Error fetching bookmarks:", chrome.runtime.lastError);
                    alert("Error: Could not fetch bookmarks. The folder may have been deleted.");
                    return;
                }

                // Extract URLs from bookmarks (filter out folders)
                const urls = bookmarks
                    .filter(bookmark => bookmark.url) // Only include items with URLs
                    .map(bookmark => bookmark.url);

                if (urls.length === 0) {
                    alert("Error: The selected bookmark folder is empty or contains no bookmarks.");
                    return;
                }

                // Proceed with the URLs from bookmarks
                proceedWithUrls(urls);
            });
        } else {
            // Use manual URL list
            proceedWithUrls(userList.urlList);
        }
    });
};

// Inject the content.js script into the appropriate browswer tab
function injectContentScript(tabId) {
    // Get tab based on tabId when tab was supposedly created
    chrome.tabs.get(tabId, (tab) => {
        if (!tab) {
            console.error("Tab not found:", tabId);
            return;
            }
        // If matching tab was found then execute the content.js script in the loaded page
        chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error("Injection error:", chrome.runtime.lastError);
            }
            else {
                // After successful injection, send along information about URL list being navigated
                chrome.tabs.sendMessage(tabId, {
                    action: "listPassing", list: selectedList, index: listIndex, length: listLength
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
    });
};