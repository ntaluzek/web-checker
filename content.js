console.log("Injected");
let selectedList;
let headerBarCreated = false;

chrome.runtime.onMessage.addListener((message, sender, sendReponse) => {
  if (message.action === "listPassing") {
    selectedList = message.list;

    if (!headerBarCreated) {
      insertHeaderBar(selectedList);
      headerBarCreated = true;
    }
  }
  sendReponse({ status: 'success'});
});

const insertHeaderBar = (selectedList) => {
    // Create Header Bar
    const headerBar = document.createElement('div');
    headerBar.id = 'headerbar';
    headerBar.style.position = 'fixed';
    headerBar.style.zIndex = '999999';
    headerBar.style.bottom = '10px';
    headerBar.style.left = '0';
    headerBar.style.width = '100%';
    headerBar.style.backgroundColor = '#f0f0f0';
    document.body.insertBefore(headerBar, document.body.firstElementChild);

    // Create Next Button
    const button = document.createElement("button");
    button.innerText = selectedList;
    button.onclick = () => {
      chrome.runtime.sendMessage({ action: "next", list: selectedList }, (response) => {
        console.log('Response from background:', response);
      });
    };
    document.getElementById('headerbar').appendChild(button);
    createFloatingBox(selectedList);
  };

  function createFloatingBox(list) {
    // Create the container for the floating box
    const floatingBox = document.createElement('div');
    floatingBox.className = 'floating-box'; // Assign a class for styling
  
    // Add some basic text
    const text = document.createElement('p');
    text.textContent = 'This is some basic text.'; // Text content
    floatingBox.appendChild(text);
  
    // Create a button
    const button = document.createElement('button');
    button.textContent = 'Click Me'; // Button text
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "next", list: list }, (response) => {
        console.log('Response from background:', response);
      });
    });
    floatingBox.appendChild(button);
  
    // Insert the floating box into the document
    document.body.appendChild(floatingBox);
  
    // Add the necessary CSS to style and position the floating box
    addFloatingBoxStyles();
  }
  
  // Function to add CSS styles for the floating box
  function addFloatingBoxStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .floating-box {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: white;
        border: 1px solid #ccc;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        border-radius: 8px;
      }
  
      .floating-box p {
        margin: 0; // No margin for the text
      }
  
      .floating-box button {
        background-color: #007bff; // Bootstrap blue
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
      }
  
      .floating-box button:hover {
        background-color: #0056b3; // Darker on hover
      }
    `;
    document.head.appendChild(style); // Inject the style into the document
  }

// if (document.readyState === 'complete' || document.readyState === 'interactive') {
//   insertHeaderBar(selectedList);
// } else {
//   window.addEventListener('DOMContentLoaded', insertHeaderBar(selectedList));
// }

// /* Listen for messages from the popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'startNavigation') {
//         // Retrieve URLs from local storage
//         chrome.storage.sync.get('urls', ({ urls }) => {
//             if (urls && urls.length > 0) {
//                 navigateToUrl(urls[0]);
//             }
//         });
//     }
// });*/

// function navigateToUrl(url) {
//     // Insert a header bar with a 'Next' button
//     const headerBar = document.createElement('div');
//     headerBar.style.position = 'fixed';
//     headerBar.style.top = '0';
//     headerBar.style.left = '0';
//     headerBar.style.width = '100%';
//     headerBar.style.backgroundColor = '#f0f0f0';
//     headerBar.innerHTML = '<button id="nextButton">Next</button>';
//     document.body.appendChild(headerBar);

//     /*// Handle 'Next' button click
//     document.getElementById('nextButton').addEventListener('click', () => {
//         // Navigate to the next URL
//         // Implement your logic here (e.g., change window.location.href)
//         // ...
//         chrome.tabs.create({url: url})
//     });*/

// const button = document.createElement("button");
// button.textContent = "Next Page";
// button.onclick = () => {
//     chrome.runtime.sendMessage({ action: "iterate_urls" });
//     console.log('Button Clicked');
//   };
// document.body.appendChild(button);
// };

// //navigateToUrl("https://smbc-comics.com");