# Web-Checker Design
Web Checker is a Chromium browser extension used to cycle through lists of websites that you like visit regularly.

# Main Components

## Popup
The popup is the window that opens up when the extension is activated. With the design of my extension, this is the main path of interacting with it and includes the start buttons for navigating through URL lists and a link to open the Options page. The popup window is a HTML page detailed in popup.html that uses Bootstrap for some CSS styling as well as some custom CSS in popup.css. There is limited JavaScript being used in the popup which is found in popup.js. JS is used in the popup to pull the lists of URLs from the chrome browser storage and then create new HTML elements in the form of buttons to correspond to each list. The settings link also has an event listener for when it is clicked to open the extension's Options page.

## Options
The options page is separate from the popup window to allow uses to have a point of static access to it. With the popup window it will automatically close when it is no longer the active window. For modifying settings I wanted this to be a persistent page that users can jump to and from as they make adjustments to their URL lists. When accessed the Options page will open in a new tab and it is built from options.html. It again uses Bootstrap and custom CSS in options.css. The JS in options.js does a fair bit of work with reading and writing from the browser's memory storage. When opened the Options page will be populated with any already saved URL lists with new div and text input elements being added to the DOM for each list. The "Add New List" button will add even more empty list divs and text inputs when clicked to allow the user to expand their collection of lists. And the "Save Lists" button will then trigger the function for saving the contents of the Options page back into storage. The saving operation will clear out any empty list inputs in order to avoid blank lists from being saved and it will check for duplicate list names. In the event of any duplicate list names the user will be prompted to make a change before saving can be completed successfully.

## content.js
content.js contains the scripting that is injected into the webpages being visited when a user is navigating the internet via Web Checker. This script creates a floating box in the bottom right corner of the webpage being visited that provides the user with information about the URL list they are browsing and a navigation button to move forward through their list. The script creates the floating box as a new set of HTML elements appended to the DOM of the webpage being visited. These elements are contained within a shadow container in order to keep the custom CSS that content.js implements separated from the rest of the webpage. This approach with a shadow container ensures that the CSS of the webpage does not impact the experience of Web Checker's floating box and that Web Checker's injected content does not interfere with the webpage being visited.

## background.js
background.js contains the JavaScript functions that enable these different parts of the extension to communicate with one another. The background.js script runs in the background, as the name would imply, and listens for the navigation messages to start the list navigation, proceed to the next page in a list, or close out of the navigation. Messages are sent either from the popup page or from the injected content to as triggers for background.js to carry out actions. When receiving a "start" message from the popup window, background.js will create a new tab in the browser and open up the next webpage in the URL list selected by the user and inject the content script into it. When receiving a "next" message from the injected content navigation button, background.js will update the tab it created to open up the next URL in the user's list and inject the content script again. And when receiving the "close" message, background.js will no longer have an event listener to inject the content script into the webpages being visited within that tab.

# Supporting Files

### manifest.json
manifest.json is a file required for all chrome extensions that provides important information about the file structure and expected behavior of the extension for the browser. This file follows a specific format of keys based on the requirements detailed by Google.

### icons
The icons folder contains a few PNG files as images of the extension's icon. The different sizes are used for different parts of the extension's implementation within the browser such as the icon displayed in the extensions menu bar and as the nav icon for the Options page when opened in a tab. I am also referencing the icons in parts of the extension's HTML to insert the icon into the popup and options page.

