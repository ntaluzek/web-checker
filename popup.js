document.addEventListener("DOMContentLoaded", () => {
	// Load existing URL Lists from storage and display them
	chrome.storage.sync.get("userLists", (data) => {
		// Either have loaded data or create empty list
		const userLists = data.userLists || [];
		// Create buttons based on saved user URL lists in their saved order
		renderUserLists(userLists);
	});

	// Add click event listener for navigating to extension options page
	const settingsButton = document.getElementById("settings");
	settingsButton.addEventListener("click", () => {
		chrome.runtime.openOptionsPage();
	});
});

// Helper function to create a button with common properties
function createButton(text, classes, styles = {}) {
	const button = document.createElement("button");
	button.textContent = text;
	button.classList.add("btn", ...classes);

	// Apply default styles
	const defaultStyles = { fontSize: "0.9em" };
	Object.assign(button.style, defaultStyles, styles);

	return button;
}

// Helper function to apply styles to an element
function applyStyles(element, styles) {
	Object.assign(element.style, styles);
}

// Function to display the list of URLs with buttons
function renderUserLists(userLists) {
    const listContainer = document.getElementById("listContainer");
    listContainer.innerHTML = '';

    userLists.forEach((list) => {
        // Create list box container
        const listBox = document.createElement("div");
        listBox.classList.add("list-box");
        applyStyles(listBox, {
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "15px",
            textAlign: "center",
            backgroundColor: "#f9f9f9"
        });

        // Create list name element
        const listName = document.createElement("div");
        listName.textContent = list.listName;
        applyStyles(listName, {
            fontWeight: "bold",
            marginBottom: "10px",
            fontSize: "1.2em"
        });

        // Create button row container
        const buttonRow = document.createElement("div");
        applyStyles(buttonRow, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        });

        // Function to create and populate the buttons once we have the URL count and list
        function createButtons(urls, totalUrls, isBookmarkList = false) {
            // Handle empty list case
            if (totalUrls === 0) {
                const emptyButton = createButton(
                    isBookmarkList ? "Empty Bookmark Folder" : "Empty List",
                    ["btn-secondary"],
                    { flex: "1", opacity: "0.5", cursor: "not-allowed" }
                );
                emptyButton.disabled = true;
                buttonRow.appendChild(emptyButton);
                return;
            }

            const currentIndex = list.index || 0;

            // Show "Start" button when at the beginning
            if (currentIndex === 0) {
                const startButton = createButton("Start", ["btn-primary", "start-button"], { flex: "1" });

                if (urls?.[0]) {
                    startButton.title = urls[0];
                }

                startButton.addEventListener("click", () => {
                    chrome.runtime.sendMessage({ action: "start", list: list.listName });
                });

                buttonRow.appendChild(startButton);
            } else {
                // Show "Resume" and "Reset" buttons when there's progress
                const resumeButton = createButton(
                    `Resume (${currentIndex + 1}/${totalUrls})`,
                    ["btn-primary", "resume-button"],
                    { flex: "1", marginRight: "5px" }
                );

                if (urls?.[currentIndex]) {
                    resumeButton.title = urls[currentIndex];
                }

                resumeButton.addEventListener("click", () => {
                    chrome.runtime.sendMessage({ action: "start", list: list.listName });
                });

                const resetButton = createButton(
                    String.fromCharCode(0x21BA),
                    ["btn-secondary", "reset-button"],
                    { width: "40px", textAlign: "center", marginLeft: "5px" }
                );

                resetButton.addEventListener("click", () => {
                    chrome.runtime.sendMessage({ action: "reset", list: list.listName }, () => {
                        // Reload the popup to show the updated button state
                        chrome.storage.sync.get("userLists", (data) => {
                            const userLists = data.userLists || [];
                            renderUserLists(userLists);
                        });
                    });
                });

                buttonRow.appendChild(resumeButton);
                buttonRow.appendChild(resetButton);
            }
        }

        // Check if this is a bookmark-based list
        if (list.isBookmarkList && list.bookmarkFolderId) {
            // Fetch bookmark count dynamically
            chrome.bookmarks.getChildren(list.bookmarkFolderId, (bookmarks) => {
                if (chrome.runtime.lastError) {
                    console.error("Error fetching bookmarks:", chrome.runtime.lastError);
                    // Show error state in button
                    createButtons([], 0, true);
                } else {
                    // Filter to only include items with URLs
                    const urls = bookmarks
                        .filter(bookmark => bookmark.url)
                        .map(bookmark => bookmark.url);
                    createButtons(urls, urls.length, true);
                }
            });
        } else {
            // Use manual URL list
            createButtons(list.urlList, list.urlList.length, false);
        }

        // Append the list name and button row to the list box
        listBox.appendChild(listName);
        listBox.appendChild(buttonRow);

        // Append the list box to the list container
        listContainer.appendChild(listBox);
    });
};