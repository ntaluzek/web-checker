# Chrome Web Store Submission Information

This document provides all the justifications and statements needed for the Chrome Web Store Developer Dashboard submission.

## Single Purpose Description

Web Checker helps you systematically cycle through custom lists of websites you visit regularly. Create named lists of URLs (like "Morning News" or "Daily Comics"), and the extension navigates you through each site in order, tracking your progress so you can resume where you left off. The extension displays a simple navigation box on each page with a "Next" button to move through your list. You can create lists manually or import them from bookmark folders. This streamlines routine browsing, ensuring you check all your chosen sites without forgetting any or getting distracted. The single purpose is: organized, sequential navigation through user-defined URL lists with progress tracking.

## Permission: `storage`

To save your custom URL lists, user preferences (keyboard shortcuts, tooltip settings), and progress tracking locally in your browser. Without this permission, the extension cannot remember your lists or settings between sessions.

## Permission: `scripting`

To inject the floating navigation box onto web pages when you're cycling through a list. This is the core functionality that displays the "Next" button and progress tracker on each website you visit. The injected element does not read or manipulate the existing contents of the page.

## Permission: `tabs`

To create new tabs and navigate to URLs from your lists. The extension needs to open websites and move between them as you cycle through your lists.

## Permission: `webNavigation`

To detect when web pages have finished loading so the extension knows when to inject the navigation interface. Without this, the floating box might appear before the page is ready or not appear at all.

## Permission: `bookmarks`

To allow users to create URL lists from existing bookmark folders. This is an optional convenience feature that reads (but does not modify) your bookmarks.

## Host Permission: `*://*/` (All URLs)

Users can add any website to their lists, and the extension must be able to inject the navigation interface on those sites. Since we cannot predict which websites users will add, we need permission for all URLs.
