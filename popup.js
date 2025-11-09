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

// Function to display the list of URLs with buttons
function renderUserLists(userLists) {
    const listContainer = document.getElementById("listContainer");
    // Clear any existing content
    listContainer.innerHTML = '';
    // Iterate through every user URL list and create the new format
    userLists.forEach((list) => {
        // Create a container for the list box
        const listBox = document.createElement("div");
        listBox.classList.add("list-box");
        listBox.style.border = "1px solid #ccc";
        listBox.style.borderRadius = "8px";
        listBox.style.padding = "10px";
        listBox.style.marginBottom = "15px";
        listBox.style.textAlign = "center";
        listBox.style.backgroundColor = "#f9f9f9";

        // Create the list name element
        const listName = document.createElement("div");
        listName.textContent = list.listName;
        listName.style.fontWeight = "bold";
        listName.style.marginBottom = "10px";
        listName.style.fontSize = "1.2em"; // Make the list name larger

        // Create a container for the buttons
        const buttonRow = document.createElement("div");
        buttonRow.style.display = "flex";
        buttonRow.style.justifyContent = "space-between";
        buttonRow.style.alignItems = "center";

        // Function to create and populate the buttons once we have the URL count and list
        function createButtons(urls, totalUrls, isBookmarkList = false) {
            // Check if the list is empty
            if (totalUrls === 0) {
                // Create a single greyed out button with appropriate message
                const emptyButton = document.createElement("button");
                emptyButton.textContent = isBookmarkList ? "Empty Bookmark Folder" : "Empty List";
                emptyButton.classList.add("btn", "btn-secondary");
                emptyButton.style.flex = "1";
                emptyButton.style.fontSize = "0.9em";
                emptyButton.disabled = true;
                emptyButton.style.opacity = "0.5";
                emptyButton.style.cursor = "not-allowed";

                // Append the empty button to the button row
                buttonRow.appendChild(emptyButton);
                return;
            }

            const currentIndex = list.index || 0;
            const progressText = `Resume (${currentIndex + 1}/${totalUrls})`;

            // Create the "Resume" button
            const resumeButton = document.createElement("button");
            resumeButton.textContent = progressText;
            resumeButton.classList.add("btn", "btn-primary", "resume-button");
            resumeButton.style.flex = "1";
            resumeButton.style.fontSize = "0.9em"; // Make the button text smaller
            resumeButton.style.marginRight = "5px";

            // Set hover text (tooltip) to show the next URL
            if (urls && urls[currentIndex]) {
                resumeButton.title = urls[currentIndex]; // Tooltip shows the current URL
            }

            resumeButton.addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "start", list: list.listName });
            });

            // Create the "Restart" button with an icon
            const restartButton = document.createElement("button");
            restartButton.classList.add("btn", "btn-secondary", "restart-button");
            restartButton.style.width = "40px"; // Restrict width to fit the icon
            restartButton.style.textAlign = "center"; // Center the icon
            restartButton.style.marginLeft = "5px";
            restartButton.style.fontSize = "0.9em"; // Make the button text smaller
            restartButton.textContent = String.fromCharCode(0x21BA); // Unicode for counterclockwise arrow
            restartButton.addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "restart", list: list.listName });
            });

            // Append the buttons to the button row
            buttonRow.appendChild(resumeButton);
            buttonRow.appendChild(restartButton);
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