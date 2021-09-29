chrome.runtime.onInstalled.addListener(async () => {

  let url = chrome.runtime.getURL("practice.html#ai");

  let tab = await chrome.tabs.create({ url });

});


chrome.action.onClicked.addListener(function(activeTab)
{
  let url = chrome.runtime.getURL("practice.html#ai");

  let tab = chrome.tabs.create({ url });
});


