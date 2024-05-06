chrome.runtime.onInstalled.addListener(() => {
    const test1 = {
        listName: 'Web Comics',
        urlList: [
            'https://www.questionablecontent.net',
            'https://www.smbc-comics.com',
            'https://www.xkcd.com',
            'https://www.toothpastefordinner.com'
        ],
        index: 0
    }
    const test2 = {
        listName: 'Test 2 List',
        urlList: [
            'https://www.example3.com',
            'https://www.example4.com'
        ],
        index: 0
    }
    chrome.storage.sync.set({ userLists: [test1, test2] }); // Initialize with an empty list
  });


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

// Store transition information for each tab
//const tabTransitions = new Map();

// Listen for the onCommitted event to store the transition type
// chrome.webNavigation.onCommitted.addListener((details) => {
//     console.log("Navigation Completed:", details.tabId, "Transition Type:", details.transitionType, "Full Details:", details);
//     tabTransitions.set(details.tabId, details.transitionType);
//   });

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

  
// function shouldInjectContentScript(url) {
//     console.log("checking url match before injection");
//     // Return a Promise that resolves to true if the URL is found, and false otherwise
//     return new Promise((resolve, reject) => {
//         // Get userLists from Chrome storage
//         chrome.storage.sync.get('userLists', function(result) {
//         if (chrome.runtime.lastError) {
//             reject(chrome.runtime.lastError); // Reject if there's an error with Chrome storage
//             return;
//         }

//         if (result.userLists && Array.isArray(result.userLists)) {
//             // Use the some() method to check if any urlList contains the given URL
//             const exists = result.userLists.some(obj => obj.urlList.includes(url));
//             resolve(exists); // Resolve the Promise with the result
//         } else {
//             resolve(false); // Resolve with false if userLists is not found or is empty
//         }
//         });
//     });
// }


//return urlList.some((listedUrl) => url.startsWith(listedUrl)); // Check if the URL matches any in the list


// // background.js
// const urls = ["https://questionablecontent.net", "https://smbc-comics.com", "https://google.com"];
// let currentIndex = 0;

// chrome.action.onClicked.addListener((tab) => {
//   if (currentIndex < urls.length) {
//     chrome.tabs.update(tab.id, { url: urls[currentIndex] });
//     currentIndex++;
//   } else {
//     console.log("All URLs visited!");
//   }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "iterate_urls") {
//         console.log('Message received');
//       if (currentIndex < urlList.length) {
//         chrome.tabs.create({ url: urlList[currentIndex] });
//         currentIndex++;
//       } else {
//         currentIndex = 0; // Reset index if it reaches the end of the list
//       }
//     }
//   });

