console.log("Injected");
let selectedList;
let listLength;
let listIndex;
let FloatingBoxCreated = false;

chrome.runtime.onMessage.addListener((message, sender, sendReponse) => {
  if (message.action === "listPassing") {
    selectedList = message.list;
    listLength = message.length;
    listProgress = message.index + 1;

    if (!FloatingBoxCreated) {
      createFloatingBox(selectedList);
      FloatingBoxCreated = true;
    }
  }
  sendReponse({ status: 'success'});
});

  function createFloatingBox(list) {
    // Create the container for the floating box
    const shadowContainer = document.createElement('div');
    const shadowRoot = shadowContainer.attachShadow({mode: 'open'}); // Create a shadow root for style encapsulation
    const floatingBox = document.createElement('div');
    floatingBox.className = 'floating-box'; // Assign a class for styling
    
    // Create a close button (x)
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
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
  
    // Add URL list title
    const urlListTitle = document.createElement('p');
    urlListTitle.classList.add("text-primary", "text-center"); // Add Bootstrap classes
    urlListTitle.textContent = list; // URL list name
    floatingBox.appendChild(urlListTitle);
  
    // Create a next button
    const button = document.createElement('button');
    button.className = 'btn btn-primary'; // Add Bootstrap primary button class
    if (listProgress === listLength) {
      button.textContent = 'Restart';
    }
    else {
      button.textContent = 'Next';
    }
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "next", list: list }, (response) => {
        console.log('Response from background:', response);
      });
    });
    floatingBox.appendChild(button);

    // Add progress text
    const progress = document.createElement('p');
    progress.classList.add("text-primary", "text-center"); // Add Bootstrap classes
    progress.textContent = listProgress + ' of ' + listLength; // Text content
    progress.style.fontFamily = 'Arial, Helvetica, sans-serif';
    floatingBox.appendChild(progress);

    // Include Bootstrap CSS
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'; // Update URL as needed
    shadowRoot.appendChild(bootstrapLink);

    const style = document.createElement('style');
    style.textContent = `
      .floating-box {
        position: fixed;
        width: 120px;
        bottom: 10px;
        right: 10px;
        background-color: rgba(255, 255, 255, 0.4);
        border: 1px solid #ccc;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        border-radius: 8px;
        text-align: center;
        content-align: center;
      }

      .floating-box p, .floating-box button {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 16px;
        font-variant: normal;
        font-weight: normal;
      }

      .floating-box p {
        margin-bottom: 2px;
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
  }
  
  // Function to add CSS styles for the floating box
  // function addFloatingBoxStyles() {
  //   const style = document.createElement('style');
  //   style.textContent = `
  //     .floating-box {
  //       position: fixed;
  //       width: 100px;
  //       bottom: 20px;
  //       right: 20px;
  //       background-color: white;
  //       border: 1px solid #ccc;
  //       padding: 10px;
  //       box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  //       z-index: 9999;
  //       border-radius: 8px;
  //       text-align: center;
  //     }
  //   `;
  //   document.head.appendChild(style); // Inject the style into the document
  //}