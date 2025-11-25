# Web-Checker
Web Checker is a Chromium browser extension used to quickly and easily cycle through lists of websites.

## Summary
We are creatures of habits and routines and browsing the internet is no exception to this. With Web Checker we can simplify that process to make our browsing experience a little bit easier and perhaps be more intentional in how we spend our time online.

With Web Checker you establish lists of URLs that you wish to visit and then it helps you cycle through those URLs. Web Checker was designed with the concept of digital minimalism in mind. You curate the lists of websites you wish to visit and then navigate through them in the order you specified. This new way of going through your routine internet browsing should help streamline the process of checking in on the websites that you repeatedly visit and helps in preventing you from wandering too far off course.

## Features

- **Multiple URL Lists** - Create and manage multiple named lists of URLs
- **Bookmark Integration** - Use bookmark folders as dynamic URL lists
- **Progress Tracking** - Resume from where you left off in any list

## Installation
As this extension is not yet available from the Chrome Web Store, you will need to proceed through the following instructions to install an unpacked extension:
1. Download the ZIP file of the extension
2. Unzip the file into a location of your choosing on your device
3. In your browser, navigate to your extensions management page. To navigate there directly you can enter the following into your URL bar, depending on the browser you are using:
    - chrome://extensions
    - brave://extensions
    - edge://extensions
4. Find the toggle for "Developer Mode" and activate it
5. Click on the button for "Load unpacked" and then select the folder where you unzipped the extension files. Your extension is now installed and ready to use.
6. **(Optional)** To make accessing the extension easier you can pin Web Checker to your toolbar

## Usage

### Managing Lists
After installed, to get started with Web Checker you will want to access the extension (either through your browser's menu or by clicking on it's icon in your extension toolbar) and click on the Settings link. This will open up the Options page for the extension where you get to create your separate lists of URLs. Each list is named and you get to order them however you'd like them to appear in the extension's popup window.

Use the "Add New List" button to create your first list. Lists can be created via two methods:
1.  Entering a list of newline separated URLs into a text field
2.  Selecting a Bookmarks folder. The extension will read each URL in the selected bookmarks folder in order as they appear in your Bookmarks manager.
After you have made any changes on the Options page please be sure to click the "Save Lists" button to store your URL lists into your browser's memory. If you do not click save before leaving the Options page then any unsaved changes you made will be lost.

If you have a list that you no longer want and wish to remove it, simply click the Delete button for that list.

### Navigating Lists
After you have at least one list created and saved then it will become accessible from the extension's popup window. Again, you can access this through your browser's menu or by clicking on it's icon in your extension toolbar. Each list that you created will have it's own button to jumpstart navigating through the list.

When you start to go through one of your lists a new tab will be created and it will automatically load the next page in your list to be viewed. After the webpage has fully loaded an additional floating box will appear in the bottom right side of the page. This is a navigation box from Web Checker that displays the name of the list you are going through, a button for moving to the next URL in your list, and a progress tracker of how far along you are in your list. This box will stay floating above all other elements of the webpage you are visiting. Clicking on the "Next" button will bring you to the next page in your list and once you reach the end you will see it read as "Restart" instead. You can also move through your list with a keyboard shortcut that you can set in the extension's settings (*Alt + Arrow Right* is the default).

In the floating box there is also a close button in the form of an x. If you decide that you no longer wish to have Web Checker present as you browse a webpage you can close out of it with this button and the floating box will no longer appear until you start up Web Checker again from the extension menu. Additionally, if you close out of the tab opened by Web Checker that will also end your session.

If you did not reach the end of your list before closing out of the Web Checker session then when you start again you will resume with the next page that you had not yet visited. This ensures that you get to go through your list in its entirety instead of having to restart back at the beginning every time.

## Privacy

Web Checker respects your privacy. All your URL lists and preferences are stored locally in your browser using Chrome Sync. No data is transmitted to external servers or the extension developer. For complete details, see our [Privacy Policy](https://github.com/ntaluzek/web-checker/blob/main/PRIVACY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ntaluzek/web-checker/issues).