console.log("Injected");
let selectedList;
let FloatingBoxCreated = false;

chrome.runtime.onMessage.addListener((message, sender, sendReponse) => {
  if (message.action === "listPassing") {
    selectedList = message.list;

    if (!FloatingBoxCreated) {
      createFloatingBox(selectedList);
      FloatingBoxCreated = true;
    }
  }
  sendReponse({ status: 'success'});
});

// const insertHeaderBar = (selectedList) => {
//     // Create Header Bar
//     const headerBar = document.createElement('div');
//     headerBar.id = 'headerbar';
//     headerBar.style.position = 'fixed';
//     headerBar.style.zIndex = '999999';
//     headerBar.style.bottom = '10px';
//     headerBar.style.left = '0';
//     headerBar.style.width = '100%';
//     headerBar.style.backgroundColor = '#f0f0f0';
//     document.body.insertBefore(headerBar, document.body.firstElementChild);

//     // Create Next Button
//     const button = document.createElement("button");
//     button.innerText = selectedList;
//     button.onclick = () => {
//       chrome.runtime.sendMessage({ action: "next", list: selectedList }, (response) => {
//         console.log('Response from background:', response);
//       });
//     };
//     document.getElementById('headerbar').appendChild(button);
//     createFloatingBox(selectedList);
//   };

  function createFloatingBox(list) {
    // Create the container for the floating box
    const shadowContainer = document.createElement('div');
    const shadowRoot = shadowContainer.attachShadow({mode: 'open'}); // Create a shadow root for style encapsulation
    const floatingBox = document.createElement('div');
    floatingBox.className = 'floating-box'; // Assign a class for styling
    
    // Create a close button (x)
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×'; // Unicode multiplication symbol
    closeButton.title = 'Close';
    closeButton.style.top = '3px'; // Position at the top-right
    closeButton.style.right = '3px'; 
    closeButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: "close"}, (response) => {
        if (response && response.success) {
          console.log('Response from background on close:', response);
          shadowContainer.remove(); // Removes the floating box
        }
        else {
          console.error('Close action failed or no response received.');
        }
      });
      
    });
    floatingBox.appendChild(closeButton);
  
    // Add some basic text
    const text = document.createElement('p');
    text.id = 'extensionText';
    text.textContent = list; // Text content
    text.style.fontFamily = 'Arial, Helvetica, sans-serif';
    floatingBox.appendChild(text);
  
    // Create a next button
    const button = document.createElement('button');
    button.className = 'next-button';
    button.id = 'extensionNextButton';
    button.textContent = 'Next'; // Button text
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "next", list: list }, (response) => {
        console.log('Response from background:', response);
      });
    });
    floatingBox.appendChild(button);



    const style = document.createElement('style');
    style.textContent = `
      .floating-box {
        position: fixed;
        width: 100px;
        bottom: 20px;
        right: 20px;
        background-color: rgba(255, 255, 255, 0.4);
        border: 1px solid #ccc;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        border-radius: 8px;
        text-align: center;
      }
  
      .floating-box p#extensionText {
        margin: 0; // No margin for the text
        margin-top: -5px;
        font-family: Arial, Helvetica, sans-serif;
        font-variant: normal;
        font-size: 16px;
        font-weight: normal;
      }
  
      .floating-box .next-button {
        background-color: rgba(40, 60, 200, 0.8);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-family: Arial, Helvetica, sans-serif;
        font-variant: normal;
        font-size: 20px;
        font-weight: normal;
      }
  
      .floating-box .next-button:hover {
        background-color: rgba(40, 60, 200, 1); //solid on hover
      }

      .floating-box .close-button {
        position: absolute; // Position relative to the floating box
        top: 3px; // Adjust to ensure the circle is within the floating box
        right: 3px; // Position the button at the top-right corner
        background-color: red; // Red circle
        color: white;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        width: 20px;
        height: 20px;
        font-size: 16px;
        text-align: center;
        line-height: 20px; // Center the X vertically
      }

      .floating-box .close-button:hover {
        background-color: darkred; // Change color on hover
      }
    `;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(floatingBox);
  
    // Insert the floating box into the document
    document.body.appendChild(shadowContainer);
  
    // Add the necessary CSS to style and position the floating box
    // addFloatingBoxStyles();
  }
  
  // Function to add CSS styles for the floating box
  function addFloatingBoxStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .floating-box {
        position: fixed;
        width: 100px;
        bottom: 20px;
        right: 20px;
        background-color: white;
        border: 1px solid #ccc;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        border-radius: 8px;
        text-align: center;
      }
  
      .floating-box p#extensionText {
        margin: 0; // No margin for the text
        font-family: Arial, Helvetica, sans-serif;
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