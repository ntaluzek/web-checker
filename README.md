# Web-Checker
Chrome Extension to cycle through a list of websites that you like to check regularly.


## Storing URL List data as a large object
const myData = {
  urlList: [
    'https://example.com/page1',
    'https://example.com/page2',
    // Add more URLs as needed
  ],
  urlCount: 2, // Example count (update as URLs are added)
  lastVisitDates: {
    'https://example.com/page1': '2024-04-28', // Replace with actual dates
    'https://example.com/page2': '2024-04-27',
    // Add more URLs and dates
  },
  accessDurationMinutes: 30, // Example duration (adjust as needed)
};

test1