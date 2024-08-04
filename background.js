let selectedList;
let listIndex;
let listLength;
let mainTab;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start" || message.action === "next") {
    console.log('Received message from content script:', message);
    sendResponse({status: 'received'});
    chrome.tabs.onUpdated.addListener(onTabUpdated);
    selectedList = message.list;
    startUrlIteration(selectedList, message.action); // Start iterating through URLs
  }
  else if (message.action === "close") {
    chrome.tabs.onUpdated.removeListener(onTabUpdated);
    sendResponse({status: 'close command received', success: true});
    console.log('Tab update listener removed.');
  }
});

// Listen for the onUpdated event to decide when to inject the content script
function onTabUpdated (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        console.log("Tab updated:", tabId, "Change info:", changeInfo);
        // const transitionType = tabTransitions.get(tabId);
        // console.log("Transition type:", transitionType);
  
      //if (transitionType && transitionType !== "typed" && transitionType !== "auto_bookmark" && transitionType !== "generated" && transitionType !== "keyword") {
       // console.log("Transition Type Confirmed for:", tabId)
        chrome.storage.local.get("sessionTabId", (data) => {
            console.log("Checking against mainTab ID:", data.sessionTabId)
            if (data.sessionTabId  === tabId) {
                injectContentScript(tabId);
            }
        })
      //}
  
      // Clean up after using the transition type
      //tabTransitions.delete(tabId);
    }
  };

function startUrlIteration(list, action) {
        chrome.storage.sync.get("userLists", (data) => {
            let userLists = data.userLists
            const userList = userLists.find(obj => obj.listName === list);
            listLength = userList.urlList.length;
            listIndex = userList.index;
            if (listIndex < listLength) {
                if (action === "start") {
                    chrome.tabs.create({ url: userList.urlList[listIndex] }, (tab) => {
                    console.log("Created new tab:", tab);
                    chrome.storage.local.set({sessionTabId: tab.id});
                    
                    console.log("Assigned Session Tab:", chrome.storage.local.get("sessionTabId"))
                    });
                }
                else if (action === "next") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentTab = tabs[0];

                        if (currentTab) {
                            const targetTabId = currentTab.id;

                            chrome.tabs.update(targetTabId, { url: userList.urlList[listIndex] }, () => {
                                console.log("Updated to next page in the same tab");
                            });
                        } else {
                            console.error("No active tab found for next injection");
                        }
                    });
                    // chrome.tabs.update({ url: userList.urlList[userList.index] }, (tab) => {
                    //     console.log("Next new page");
                    //     injectContentScript(tab.id); //Attempt to inject content script
                    // });
                }

                userList.index += 1;
                if (userList.index >= listLength) {
                    userList.index = 0;
                };
                chrome.storage.sync.set({userLists: userLists});
            }
        });
    }

function injectContentScript(tabId) {
    console.log("Attempting to inject content script into tab:", tabId);
    chrome.tabs.get(tabId, (tab) => {
        //if (shouldInjectContentScript(tab.url)) {
        if (!tab) {
            console.error("Tab not found:", tabId);
            return;
            }
        console.log("Injecting content script into tab:", tab);
        chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error("Injection error:", chrome.runtime.lastError);
            }
            else {
                console.log("Content script injected:", results);
                chrome.tabs.sendMessage(tabId, {
                    action: "listPassing", list: selectedList, index: listIndex, length: listLength
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Message sent successfully:', response)
                    }
                });
            }
        });
        //}
    });
}