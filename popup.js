document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start");
    const listSelector = document.getElementById("listSelector");
    const settingsButton = document.getElementById("settings");
  
    // Load existing URL Lists from storage and display them
    chrome.storage.sync.get("userLists", (data) => {
        const userLists = data.userLists || [];
        renderUserLists(userLists);
      });


    if (startButton) {
      startButton.addEventListener("click", () => {
        const selectedList = document.getElementById("listSelector").value;
        chrome.runtime.sendMessage({ action: "start", list: selectedList});
      });
    }

    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            chrome.runtime.openOptionsPage();
        });
    }
  
    // Function to display the list of URLs with buttons
function renderUserLists(userLists) {
  const listContainer = document.getElementById("listContainer");
  listContainer.innerHTML = ''; // Clear any existing buttons

  userLists.forEach((list, index) => {
      const button = document.createElement("button");
      button.textContent = list.listName;
      button.classList.add("btn", "btn-primary", "list-button"); // Add Bootstrap classes
      button.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "start", list: list.listName});
          console.log(`Button ${list.listName} clicked`);
      });
      listContainer.appendChild(button);
  });
}

});
