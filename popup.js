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
    
//   addButton.addEventListener("click", () => {
//       const newUrl = urlInput.value.trim();
//       if (newUrl) {
//         chrome.storage.sync.get("urlList", (data) => {
//           const urlList = data.urlList || [];
//           if (!urlList.includes(newUrl)) {
//             urlList.push(newUrl);
//             chrome.storage.sync.set({ urlList });
//             renderUserLists(urlList); // Refresh the list
//             urlInput.value = ""; // Clear the input
//           }
//         });
//       }
//     });
  
    // Function to display the list of URLs with remove buttons
    function renderUserLists(userLists) {
        userLists.forEach((list, index) => {
        const listItem = document.createElement("option");
        listItem.textContent = list.listName;
        listSelector.appendChild(listItem);
      });
    }
});
// document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('startNavigation').addEventListener('click', () => {
//         // Send a message to the content script to start navigation
//         //chrome.tabs.create({url: "https://www.questionablecontent.net"})
//         chrome.action.openPopup();
//     });
    
    
//     document.getElementById('openSettings').addEventListener('click', () => {
//         // Open the settings page
//         chrome.runtime.openOptionsPage();
//     });
// });