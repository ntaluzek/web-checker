// Prevent multiple executions of this content script
if (window.webCheckerContentScriptLoaded) {
	// Script already loaded, exit early
} else {
	window.webCheckerContentScriptLoaded = true;

// Declare global variables
let selectedList;
let listLength;
let listIndex;
let FloatingBoxCreated = false;
let nextButton = null; // Store reference to the next/restart button
let keyboardShortcut = null; // Store the current keyboard shortcut configuration
let showTooltip = true; // Store whether to show tooltip (default: true)

// Default keyboard shortcut configuration
const defaultShortcut = {
	alt: true,
	ctrl: false,
	shift: false,
	meta: false,
	key: 'ArrowRight'
};

// Listen for message details about URL list
chrome.runtime.onMessage.addListener((message, sender, sendReponse) => {
	if (message.action === 'listPassing') {
		selectedList = message.list;
		listLength = message.length;
		listProgress = message.index + 1;
		// If the floating box hasn't been created yet then do so
		if (!FloatingBoxCreated) {
			createFloatingBox(selectedList);
			FloatingBoxCreated = true;
		}
	}
	sendReponse({ status: 'success'});
});

// Load keyboard shortcut configuration and tooltip setting from storage
chrome.storage.sync.get(["keyboardShortcut", "showTooltip"], (data) => {
	keyboardShortcut = data.keyboardShortcut || defaultShortcut;
	showTooltip = data.showTooltip !== undefined ? data.showTooltip : true;
});

// Listen for changes to keyboard shortcut and tooltip setting in storage (real-time updates)
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === 'sync') {
		// Update keyboard shortcut if changed
		if (changes.keyboardShortcut) {
			keyboardShortcut = changes.keyboardShortcut.newValue || defaultShortcut;
			// Update button tooltip when shortcut changes
			if (nextButton) {
				updateButtonTooltip(nextButton);
			}
		}

		// Update tooltip visibility if changed
		if (changes.showTooltip) {
			showTooltip = changes.showTooltip.newValue !== undefined ? changes.showTooltip.newValue : true;
			// Update button tooltip when setting changes
			if (nextButton) {
				updateButtonTooltip(nextButton);
			}
		}
	}
});

// Function to format shortcut for display in tooltip
function formatShortcutForTooltip(shortcut) {
	if (!shortcut) return '';

	const modifiers = [];
	if (shortcut.ctrl) modifiers.push('Ctrl');
	if (shortcut.alt) modifiers.push('Alt');
	if (shortcut.shift) modifiers.push('Shift');
	if (shortcut.meta) modifiers.push('Meta');

	// Format the key name for better readability
	let keyName = shortcut.key;
	if (keyName.startsWith('Arrow')) {
		keyName = keyName.replace('Arrow', 'Arrow ');
	}

	return modifiers.length > 0
		? `${modifiers.join(' + ')} + ${keyName}`
		: keyName;
}

// Function to update button tooltip with current keyboard shortcut
function updateButtonTooltip(button) {
	if (showTooltip) {
		const shortcutText = formatShortcutForTooltip(keyboardShortcut || defaultShortcut);
		button.title = `Keyboard shortcut: ${shortcutText}`;
	} else {
		// Remove tooltip if disabled
		button.title = '';
	}
}

// Add keyboard shortcut listener for Next/Restart button
// Supports configurable keyboard shortcuts (default: Alt + ArrowRight)
document.addEventListener('keydown', (event) => {
	// Skip if shortcut hasn't loaded yet or button doesn't exist
	if (!keyboardShortcut || !nextButton) {
		return;
	}

	// Check if the pressed key combination matches the configured shortcut
	const shortcutMatches =
		event.key === keyboardShortcut.key &&
		event.ctrlKey === keyboardShortcut.ctrl &&
		event.altKey === keyboardShortcut.alt &&
		event.shiftKey === keyboardShortcut.shift &&
		event.metaKey === keyboardShortcut.meta;

	if (shortcutMatches) {
		// Prevent default browser behavior
		event.preventDefault();
		// Trigger the next/restart button click
		nextButton.click();
	}
});

// Create the floating navigation box for proceeding through the URL list
function createFloatingBox(list) {
	// Create the container for the floating box
	const shadowContainer = document.createElement('div');
	// Create a shadow root for style encapsulation
	const shadowRoot = shadowContainer.attachShadow({mode: 'open'}); 
	const floatingBox = document.createElement('div');
	floatingBox.className = 'floating-box';

	// Create a close button (x)
	const closeButton = document.createElement('button');
	closeButton.className = 'close-button';
	closeButton.textContent = '×';
	closeButton.title = 'Close';
	// Position close button at the top-right of the floating box
	closeButton.style.top = '3px'; 
	closeButton.style.right = '3px'; 
	// When clicked, remove floating box and send a closing message to prevent more
	// from being created on new page loads
	closeButton.addEventListener('click', () => {
	chrome.runtime.sendMessage({action: 'close'}, (response) => {
		if (response && response.success) {
		shadowContainer.remove(); // Removes the floating box
		}
		else {
		console.error('Close action failed or no response received.');
		}
	});

	});
	floatingBox.appendChild(closeButton);

	// Add URL list title
	const urlListTitle = document.createElement('span');
	urlListTitle.classList.add('custom-text-primary');
	urlListTitle.textContent = list;
	floatingBox.appendChild(urlListTitle);

	// Create a next button
	const button = document.createElement('button');
	button.className = 'custom-btn-primary';
	// Determine if there are more URLs to visit, or if at end of list to "restart"
	if (listProgress === listLength) {
		button.textContent = 'Restart';
	}
	else {
		button.textContent = 'Next';
	}
	button.addEventListener('click', () => {
		chrome.runtime.sendMessage({ action: 'next', list: list });
	});
	floatingBox.appendChild(button);

	// Store button reference globally for keyboard shortcut access
	nextButton = button;

	// Add tooltip with keyboard shortcut hint
	updateButtonTooltip(button);

	// Add text to show progress through URL list (X of Y)
	const progress = document.createElement('span');
	progress.classList.add('custom-text-primary');
	progress.textContent = listProgress + ' of ' + listLength;
	progress.style.fontFamily = 'Arial, Helvetica, sans-serif';
	floatingBox.appendChild(progress);

	// Add custom CSS styling to shadowRoot
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
		z-index: 999999;
		border-radius: 8px;
		text-align: center;
		content-align: center;
	}

	.floating-box span, .floating-box button {
		font-family: Arial, Helvetica, sans-serif;
		font-size: 16px;
		font-variant: normal;
		font-weight: normal;
		text-align: center;
		display: block;
		text-align: center;
	}

	.floating-box .close-button {
		position: absolute;
		top: 3px;
		right: 3px;
		background-color: lightgrey;
		color: white;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		width: 20px;
		height: 20px;
		font-size: 16px;
		text-align: center;
		line-height: 20px;
	}

	.floating-box .close-button:hover {
		background-color: darkred;
	}

	.custom-btn-primary {
		color: #fff;
		background-color: #0d6efd;
		border-color: #0d6efd;
		display: block;
		margin: 0 auto;
		font-weight: 400;
		text-align: center;
		vertical-align: middle;
		user-select: none;
		border: 1px solid transparent;
		padding: 0.375rem 0.75rem;
		font-size: 1rem;
		line-height: 1.5;
		border-radius: 0.375rem;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}

	.custom-btn-primary:hover {
		color: #fff;
		background-color: #0b5ed7;
		border-color: #0a58ca;
	}
	`;
	shadowRoot.appendChild(style);
	shadowRoot.appendChild(floatingBox);

	// Insert the floating box into the document
	document.body.appendChild(shadowContainer);
};

} // End of script guard