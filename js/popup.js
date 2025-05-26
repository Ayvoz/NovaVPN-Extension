// Screen Elements
const screens = {
    login: document.getElementById('loginScreen'),
    signup: document.getElementById('signupScreen'),
    main: document.getElementById('mainScreen'),
    settings: document.getElementById('settingsScreen')
};

// Navigation Functions
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.style.display = 'none');
    screens[screenName].style.display = screenName === 'main' ? 'block' : 'flex';
}

// Initialize - Check if user is logged in
document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await checkAuthStatus();
    if (isLoggedIn) {
        showScreen('main');
        loadUserData();
        loadServerList();
    } else {
        showScreen('login');
    }
});

// Auth Functions
async function checkAuthStatus() {
    return new Promise(resolve => {
        chrome.storage.local.get(['authToken'], result => {
            resolve(!!result.authToken);
        });
    });
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // TODO: Replace with actual API call
        const response = await mockLogin(email, password);
        
        if (response.success) {
            // Save auth token
            chrome.storage.local.set({ 
                authToken: response.token,
                userEmail: email 
            });
            
            showScreen('main');
            loadUserData();
            loadServerList();
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
    }
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        // TODO: Replace with actual API call
        const response = await mockSignup(email, password);
        
        if (response.success) {
            alert('Account created successfully! Please login.');
            showScreen('login');
        }
    } catch (error) {
        console.error('Signup failed:', error);
        alert('Signup failed. Please try again.');
    }
});

// Navigation Links
document.getElementById('signupLink').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('signup');
});

document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('login');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    showScreen('settings');
});

document.getElementById('backBtn').addEventListener('click', () => {
    showScreen('main');
});

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    // Disconnect if connected
    if (connectionState.isConnected) {
        await disconnect();
    }
    
    // Clear storage
    chrome.storage.local.clear();
    
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'logout' });
    
    // Show login screen
    showScreen('login');
});

// Connection Management
const connectionState = {
    isConnected: false,
    selectedServer: null,
    connectionStartTime: null,
    dataUsed: 0
};

const connectBtn = document.getElementById('connectBtn');
const statusCircle = document.getElementById('statusCircle');
const statusText = document.getElementById('statusText');
const connectIcon = document.getElementById('connectIcon');

connectBtn.addEventListener('click', async () => {
    if (connectionState.isConnected) {
        await disconnect();
    } else {
        await connect();
    }
});

async function connect() {
    if (!connectionState.selectedServer) {
        alert('Please select a server first');
        return;
    }
    
    // Show loading state
    connectBtn.disabled = true;
    connectIcon.textContent = '...';
    
    try {
        // Send connect message to background script
        const response = await chrome.runtime.sendMessage({
            action: 'connect',
            server: connectionState.selectedServer
        });
        
        if (response.success) {
            connectionState.isConnected = true;
            connectionState.connectionStartTime = Date.now();
            updateConnectionUI(true);
            startMetricsUpdate();
        } else {
            throw new Error(response.error || 'Connection failed');
        }
    } catch (error) {
        console.error('Connection error:', error);
        alert('Failed to connect. Please try again.');
    } finally {
        connectBtn.disabled = false;
    }
}

async function disconnect() {
    try {
        await chrome.runtime.sendMessage({ action: 'disconnect' });
        connectionState.isConnected = false;
        updateConnectionUI(false);
        stopMetricsUpdate();
    } catch (error) {
        console.error('Disconnect error:', error);
    }
}

function updateConnectionUI(isConnected) {
    if (isConnected) {
        statusCircle.classList.add('connected');
        statusText.textContent = 'Connected';
        connectBtn.classList.add('connected');
        connectIcon.textContent = '✕';
    } else {
        statusCircle.classList.remove('connected');
        statusText.textContent = 'Disconnected';
        connectBtn.classList.remove('connected');
        connectIcon.textContent = '⚡';
        document.getElementById('currentIP').textContent = '---.---.---.---';
        document.getElementById('uptime').textContent = '00:00';
        document.getElementById('dataUsed').textContent = '0 MB';
    }
}

// Server Selection
const servers = [
    { id: 'us', flag: '🇺🇸', name: 'United States', ip: '192.168.1.101', latency: 12 },
    { id: 'uk', flag: '🇬🇧', name: 'United Kingdom', ip: '192.168.1.102', latency: 45 },
    { id: 'de', flag: '🇩🇪', name: 'Germany', ip: '192.168.1.103', latency: 38 },
    { id: 'jp', flag: '🇯🇵', name: 'Japan', ip: '192.168.1.104', latency: 120 },
    { id: 'sg', flag: '🇸🇬', name: 'Singapore', ip: '192.168.1.105', latency: 85 }
];

function loadServerList() {
  const serverList = document.getElementById('serverList');
  serverList.innerHTML = '';

  servers.forEach(server => {
    // Create server item container
    const serverItem = document.createElement('div');
    serverItem.className = 'server-item';
    serverItem.dataset.serverId = server.id;

    // Server flag and name
    serverItem.innerHTML = `
      <span class="server-flag">${server.flag}</span>
      <span class="server-name">${server.name}</span>
      <span class="server-latency">${server.latency} ms</span>
      <button class="connect-btn">Connect</button>
    `;

    // Append to the list
    serverList.appendChild(serverItem);

    // Connect button handler
    const connectBtn = serverItem.querySelector('.connect-btn');
    connectBtn.addEventListener('click', () => {
      if (connectionState.selectedServer === server.id) {
        alert('You are already connected to this server.');
        return;
      }
      connectionState.selectedServer = server.id;
      connect();
    });
  });
}
