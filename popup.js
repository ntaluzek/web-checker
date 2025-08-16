document.addEventListener("DOMContentLoaded", () => {
	// Load existing URL Lists from storage and display them
	chrome.storage.sync.get("userLists", (data) => {
		// Either have loaded data or create empty list
		const userLists = data.userLists || [];
		// Reverse the userLists array since they are stored in reverse within options.js
		const reversedUserLists = userLists.reverse();
		// Create buttons based on saved user URL lists
		renderUserLists(reversedUserLists);
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
    // Clear any existing buttons
    listContainer.innerHTML = '';
    // Iterate through every user URL list and create buttons for that list
    userLists.forEach((list, index) => {
        // Create a container for the buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        buttonContainer.style.display = "flex";
        buttonContainer.style.alignItems = "center";
        buttonContainer.style.marginBottom = "10px";

        // Create the "Start" button
        const startButton = document.createElement("button");
        startButton.textContent = list.listName;
        startButton.classList.add("btn", "btn-primary", "list-button");
        startButton.style.marginRight = "10px";
        startButton.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "start", list: list.listName });
        });

        // Create the "Restart" button
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart";
        restartButton.classList.add("btn", "btn-secondary", "restart-button");
        restartButton.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "restart", list: list.listName });
        });

        // Append both buttons to the container
        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(restartButton);

        // Append the container to the list container
        listContainer.appendChild(buttonContainer);
    });
};