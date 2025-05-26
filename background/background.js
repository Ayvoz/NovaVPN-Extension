// === NovaVPN Extension: background.js ===

let isConnected = false;
let currentProxy = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'toggleVPN') {
    if (!isConnected) {
      // Connect to proxy
      const url = new URL(msg.proxy);
      chrome.proxy.settings.set({
        value: {
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: url.protocol.replace(':', ''),
              host: url.hostname,
              port: parseInt(url.port)
            },
            bypassList: ["<local>"]
          }
        },
        scope: 'regular'
      }, () => {
        isConnected = true;
        currentProxy = msg.proxy;
        chrome.runtime.sendMessage({ status: 'Connected' });
        console.log('VPN Connected to:', msg.proxy);
      });

    } else {
      // Disconnect proxy
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {
        isConnected = false;
        currentProxy = null;
        chrome.runtime.sendMessage({ status: 'Disconnected' });
        console.log('VPN Disconnected');
      });
    }
  }
});
