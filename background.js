chrome.action.onClicked.addListener(function(activeTab)
    {
        let url = chrome.runtime.getURL("html/practice.html?ai");

        let tab = chrome.tabs.create({ url });
    });



