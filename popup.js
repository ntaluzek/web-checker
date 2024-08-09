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
	// Iterate through ever user URL list and create a button for that list
	userLists.forEach((list, index) => {
		const button = document.createElement("button");
		button.textContent = list.listName;
		button.classList.add("btn", "btn-primary", "list-button");
		button.addEventListener("click", () => {
			chrome.runtime.sendMessage({ action: "start", list: list.listName});
		});
		listContainer.appendChild(button);
	});
};