// Background Service Worker for NovaVPN Extension

// Connection state
let connectionState = {
    isConnected: false,
    currentServer: null,
    currentIP: null,
    originalIP: null,
    proxyCredentials: null
};

// Settings
let extensionSettings = {
    killSwitch: false,
    webrtcProtection: true,
    autoConnect: false,
    autoReconnect: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('NovaVPN Extension installed');
    
    // Set default icon
    updateIcon(false);
    
    // Load settings
    loadSettings();
    
    // Apply WebRTC protection if enabled
    applyWebRTCProtection();
});

// Load settings from storage
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                extensionSettings = { ...extensionSettings, ...result.settings };
            }
            resolve();
        });
    });
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
    return true; // Keep message channel open for async response
});

async function handleMessage(request, sender, sendResponse) {
    switch (request.action) {
        case 'connect':
            const connectResult = await connectToServer(request.server);
            sendResponse(connectResult);
            break;
            
        case 'disconnect':
            const disconnectResult = await disconnectFromServer();
            sendResponse(disconnectResult);
            break;
            
        case 'getStatus':
            sendResponse({
                isConnected: connectionState.isConnected,
                currentServer: connectionState.currentServer,
                currentIP: connectionState.currentIP
            });
            break;
            
        case 'updateSettings':
            extensionSettings = { ...extensionSettings, ...request.settings };
            chrome.storage.local.set({ settings: extensionSettings });
            applySettings();
            sendResponse({ success: true });
            break;
            
        case 'logout':
            await handleLogout();
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
}

// Connect to VPN server
async function connectToServer(server) {
    try {
        console.log('Connecting to server:', server);
        
        // Get proxy credentials from your backend API
        const credentials = await fetchProxyCredentials(server);
        
        if (!credentials) {
            throw new Error('Failed to get proxy credentials');
        }
        
        // Configure proxy
        const config = {
            value: {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: "http",
                        host: server.ip,
                        port: 8888 // Your proxy port
                    }
                }
            },
            scope: "regular"
        };
        
        await chrome.proxy.settings.set(config);
        
        // Store credentials for auth
        connectionState.proxyCredentials = credentials;
        
        // Update connection state
        connectionState.isConnected = true;
        connectionState.currentServer = server;
        
        // Get new IP
        await updateCurrentIP();
        
        // Update icon
        updateIcon(true);
        
        // Notify popup
        chrome.runtime.sendMessage({
            action: 'connectionStatusChanged',
            isConnected: true
        });
        
        return { success: true };
        
    } catch (error) {
        console.error('Connection error:', error);
        return { success: false, error: error.message };
    }
}

// Disconnect from VPN server
async function disconnectFromServer() {
    try {
        // Clear proxy settings
        await chrome.proxy.settings.clear({});
        
        // Update connection state
        connectionState.isConnected = false;
        connectionState.currentServer = null;
        connectionState.proxyCredentials = null;
        
        // Restore original IP
        connectionState.currentIP = connectionState.originalIP;
        
        // Update icon
        updateIcon(false);
        
        // Notify popup
        chrome.runtime.sendMessage({
            action: 'connectionStatusChanged',
            isConnected: false
        });
        
        return { success: true };
        
    } catch (error) {
        console.error('Disconnect error:', error);
        return { success: false, error: error.message };
    }
}

// Proxy authentication handler
chrome.webRequest.onAuthRequired.addListener(
    (details) => {
        if (connectionState.proxyCredentials) {
            return {
                authCredentials: {
                    username: connectionState.proxyCredentials.username,
                    password: connectionState.proxyCredentials.password
                }
            };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Update current IP address
async function updateCurrentIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        
        if (!connectionState.originalIP) {
            connectionState.originalIP = data.ip;
        }
        connectionState.currentIP = data.ip;
        
    } catch (error) {
        console.error('Failed to get IP:', error);
    }
}

// Update extension icon
function updateIcon(isConnected) {
    const iconPath = isConnected ? 
        'icons/icon-connected.png' : 
        'icons/icon-disconnected.png';
    
    // Note: You'll need to create these icon files
    chrome.action.setIcon({
        path: {
            "16": iconPath,
            "32": iconPath,
            "48": iconPath,
            "128": iconPath
        }
    });
    
    // Update badge
    chrome.action.setBadgeText({
        text: isConnected ? 'ON' : ''
    });
    
    chrome.action.setBadgeBackgroundColor({
        color: '#00d4ff'
    });
}

// Apply settings
function applySettings() {
    // Apply WebRTC protection
    applyWebRTCProtection();
    
    // Apply kill switch
    if (extensionSettings.killSwitch && connectionState.isConnected) {
        enableKillSwitch();
    } else {
        disableKillSwitch();
    }
}

// WebRTC Protection
function applyWebRTCProtection() {
    if (extensionSettings.webrtcProtection) {
        chrome.privacy.network.webRTCIPHandlingPolicy.set({
            value: 'disable_non_proxied_udp'
        });
    } else {
        chrome.privacy.network.webRTCIPHandlingPolicy.clear({});
    }
}

// Kill Switch implementation
function enableKillSwitch() {
    // Block all requests if VPN disconnects
    chrome.webRequest.onBeforeRequest.addListener(
        killSwitchHandler,
        { urls: ["<all_urls>"] },
        ["blocking"]
    );
}

function disableKillSwitch() {
    chrome.webRequest.onBeforeRequest.removeListener(killSwitchHandler);
}

function killSwitchHandler(details) {
    if (!connectionState.isConnected && extensionSettings.killSwitch) {
        return { cancel: true };
    }
}

// Handle logout
async function handleLogout() {
    // Disconnect if connected
    if (connectionState.isConnected) {
        await disconnectFromServer();
    }
    
    // Clear all data
    connectionState = {
        isConnected: false,
        currentServer: null,
        currentIP: null,
        originalIP: null,
        proxyCredentials: null
    };
}

// Mock function to fetch proxy credentials (replace with real API call)
async function fetchProxyCredentials(server) {
    // TODO: Replace with actual API call to your backend
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                username: 'user_' + Date.now(),
                password: 'pass_' + Math.random().toString(36).substring(7)
            });
        }, 500);
    });
}

// Auto-connect on startup if enabled
chrome.runtime.onStartup.addListener(async () => {
    await loadSettings();
    
    if (extensionSettings.autoConnect) {
        // Get last connected server
        chrome.storage.local.get(['lastServer'], async (result) => {
            if (result.lastServer) {
                await connectToServer(result.lastServer);
            }
        });
    }
});

// Monitor proxy errors
chrome.proxy.onProxyError.addListener((details) => {
    console.error('Proxy error:', details);
    
    // Auto-reconnect if enabled
    if (extensionSettings.autoReconnect && connectionState.isConnected) {
        setTimeout(() => {
            connectToServer(connectionState.currentServer);
        }, 5000);
    }
});