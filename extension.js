var browser = (typeof(browser) != "undefined") ? browser : chrome;

browser.contextMenus.create({
    id: 'export',
    title: 'Export mesh',
    contexts: ['action']
})

function contextClick(info, tab) {
    const { menuItemId } = info
  
    if (menuItemId === 'export') {
        browser.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['scanExporter.js'],
            world: 'MAIN'
        });
    }
}
  
browser.contextMenus.onClicked.addListener(contextClick)