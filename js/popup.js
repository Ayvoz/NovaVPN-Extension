import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";

console.log('Starting Firebase initialization...');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoY1qWXDW8cZ22SxufIwP5cWq8S-aQvqY",
  authDomain: "novavpn-ex.firebaseapp.com",
  databaseURL: "https://novavpn-ex-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "novavpn-ex",
  storageBucket: "novavpn-ex.appspot.com",
  messagingSenderId: "425744438409",
  appId: "1:425744438409:web:f94307996a63b3df1c6258",
  measurementId: "G-H40Y1HBS8G"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized');

const auth = getAuth(app);
console.log('Firebase auth initialized');

const db = getDatabase(app);
console.log('Firebase database initialized');

// ========================= 
// 🌟 VPN EXTENSION POPUP LOGIC
// =========================

// Add this after the VPNPopup class definition or inside it as static data
const SERVER_LIST = [
    { name: 'United States', flag: 'us' },
    { name: 'United Kingdom', flag: 'gb' },
    { name: 'Germany', flag: 'de' },
    { name: 'Singapore', flag: 'sg' },
    { name: 'Japan', flag: 'jp' },
    { name: 'Australia', flag: 'au' },
    { name: 'Canada', flag: 'ca' },
    { name: 'France', flag: 'fr' },
    { name: 'Netherlands', flag: 'nl' },
    { name: 'India', flag: 'in' },
];

class VPNPopup {
    constructor() {
        console.log('NovaVPN Popup: Constructor called');
        this.isConnected = false;
        this.isConnecting = false;
        this.connectionTimer = null;
        this.statsTimer = null;
        this.connectionTime = 0;
        
        // Speed simulation
        this.downloadSpeed = 0;
        this.uploadSpeed = 0;
        this.overallSpeed = 0;
        
        this.init();
    }

    init() {
        console.log('NovaVPN Popup: Initializing...');
        this.bindEvents();
        this.setupAuthListener();
    }

    // ========================= 
    // 🌟 EVENT HANDLERS
    // =========================
    
    bindEvents() {
        console.log('NovaVPN Popup: Binding events...');

        // Main VPN button
        const powerButton = document.getElementById('vpn-power-button');
        if (powerButton) {
            powerButton.addEventListener('click', () => {
                console.log('Power button clicked!');
                this.toggleVPN();
            });
        } else {
            console.log('Power button (vpn-power-button) not found.');
        }

        // Settings icon
        const settingsIcon = document.getElementById('vpn-settings');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                console.log('Settings icon clicked!');
                this.showSettings();
            });
        } else {
            console.log('Settings icon (vpn-settings) not found.');
        }

        // Back button
        const backButton = document.getElementById('back-to-vpn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log('Back button clicked!');
                this.showVPN();
            });
        } else {
            console.log('Back button (back-to-vpn) not found.');
        }

        // Server selection pill (now with popup)
        const serverPill = document.getElementById('server-selection-pill');
        if (serverPill) {
            serverPill.addEventListener('click', () => {
                console.log('Server selection pill clicked! Showing server list screen.');
                this.renderServerList();
                this.showScreen('server-list-screen');
            });
        } else {
            console.log('Server selection pill not found.');
        }

        // Back from server list
        const backFromServers = document.getElementById('back-to-vpn-from-servers');
        if (backFromServers) {
            backFromServers.addEventListener('click', () => {
                console.log('Back from server list clicked! Returning to VPN screen.');
                this.showScreen('vpn-screen');
            });
        } else {
            console.log('Back from server list button not found.');
        }

        // Auth screens
        const goSignup = document.getElementById('go-signup');
        if (goSignup) {
            goSignup.addEventListener('click', () => {
                console.log('Go to Signup link clicked!');
                this.showSignup();
            });
        } else {
            console.log('Go to Signup link (go-signup) not found.');
        }

        const goLogin = document.getElementById('go-login');
        if (goLogin) {
            goLogin.addEventListener('click', () => {
                console.log('Go to Login link clicked!');
                this.showLogin();
            });
        } else {
            console.log('Go to Login link (go-login) not found.');
        }

        // Login/Signup buttons (on auth cards)
        const loginButton = document.querySelector('#login-screen .auth-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                console.log('Login button clicked!');
                const email = document.querySelector('#login-screen .auth-input[type="text"]').value;
                const password = document.querySelector('#login-screen .auth-input[type="password"]').value;
                this.login(email, password);
            });
        } else {
            console.log('Login button not found on login screen.');
        }

        const signupButton = document.querySelector('#signup-screen .auth-button');
        if (signupButton) {
            signupButton.addEventListener('click', () => {
                console.log('Signup button clicked!');
                const email = document.querySelector('#signup-screen .auth-input[type="text"]').value;
                const password = document.querySelector('#signup-screen .auth-input[type="password"]').value;
                const confirmPassword = document.querySelector('#signup-screen .auth-input[placeholder="Confirm Password"]').value; // Get confirm password
                
                if (password !== confirmPassword) {
                    this.showNotification('Passwords do not match.', 'error');
                    console.error('Signup failed: Passwords do not match.');
                    return;
                }
                this.signup(email, password);
            });
        } else {
            console.log('Signup button not found on signup screen.');
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Logout button clicked!');
                this.logout();
            });
        } else {
            console.log('Logout button (logout-button) not found.');
        }
    }

    // ========================= 
    // 🌟 VPN CONNECTION LOGIC
    // =========================

    async toggleVPN() {
        console.log('toggleVPN invoked.', { isConnecting: this.isConnecting, isConnected: this.isConnected });
        if (this.isConnecting) return;

        if (this.isConnected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }

    async connect() {
        console.log('Connecting to VPN...');
        this.isConnecting = true;
        this.updateUI();

        // Simulate connection process
        await this.simulateConnection();

        this.isConnecting = false;
        this.isConnected = true;
        this.startConnectionTimer();
        this.startStatsUpdates();
        this.updateUI();
        console.log('VPN Connected.');
    }

    disconnect() {
        console.log('Disconnecting VPN...');
        this.isConnected = false;
        this.connectionTime = 0;
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }

        if (this.statsTimer) {
            clearInterval(this.statsTimer);
            this.statsTimer = null;
        }

        this.downloadSpeed = 0;
        this.uploadSpeed = 0;
        this.overallSpeed = 0;

        this.updateUI();
        console.log('VPN Disconnected.');
    }

    async simulateConnection() {
        console.log('Simulating connection delay...');
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Simulated connection delay finished.');
                resolve();
            }, 2000 + Math.random() * 2000); // 2-4 seconds
        });
    }

    startConnectionTimer() {
        this.connectionTimer = setInterval(() => {
            this.connectionTime++;
            this.updateTimer();
        }, 1000);
    }

    startStatsUpdates() {
        this.statsTimer = setInterval(() => {
            this.updateSpeedStats();
        }, 1000);
    }

    updateTimer() {
        const hours = Math.floor(this.connectionTime / 3600);
        const minutes = Math.floor((this.connectionTime % 3600) / 60);
        const seconds = this.connectionTime % 60;

        const timerElement = document.getElementById('vpn-timer');
        if (timerElement) {
            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateSpeedStats() {
        // Simulate realistic speed fluctuations
        this.downloadSpeed = (45 + Math.random() * 25);
        this.uploadSpeed = (8 + Math.random() * 12);

        // Update UI
        const downloadElement = document.getElementById('vpn-download-speed');
        const uploadElement = document.getElementById('vpn-upload-speed');

        if (downloadElement) {
            downloadElement.innerHTML = `${this.downloadSpeed.toFixed(1)} <small>Mbps</small>`;
        }

        if (uploadElement) {
            uploadElement.innerHTML = `${this.uploadSpeed.toFixed(1)} <small>Mbps</small>`;
        }
    }

    // ========================= 
    // 🌟 UI STATE MANAGEMENT
    // =========================

    updateUI() {
        const powerButton = document.getElementById('vpn-power-button');
        const connectionStatusText = document.querySelector('.connection-status .status-text');
        const statusDot = document.querySelector('.connection-status .status-dot');

        if (!powerButton || !connectionStatusText || !statusDot) return;

        // Reset classes
        powerButton.classList.remove('connecting', 'connected');
        connectionStatusText.textContent = 'Disconnected';
        statusDot.classList.remove('connected');
        statusDot.classList.add('disconnected'); // Assuming a disconnected state class

        if (this.isConnecting) {
            powerButton.classList.add('connecting');
            connectionStatusText.textContent = 'Connecting...';
            statusDot.classList.remove('disconnected');
            statusDot.classList.add('connecting'); // Assuming a connecting state class
        } else if (this.isConnected) {
            powerButton.classList.add('connected');
            connectionStatusText.textContent = 'Connected';
            statusDot.classList.remove('disconnected');
            statusDot.classList.add('connected');
        } else {
            // Already handled by reset
        }
    }

    // ========================= 
    // 🌟 SCREEN NAVIGATION
    // =========================

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        targetScreen?.classList.remove('hidden');
    }

    showVPN() {
        this.showScreen('vpn-screen');
        // Ensure VPN screen elements are visible/correctly styled on show
        this.updateUI();
    }

    showLogin() {
        this.showScreen('login-screen');
    }

    showSignup() {
        this.showScreen('signup-screen');
    }

    showSettings() {
        this.showScreen('settings-screen');
    }

    // ========================= 
    // 🌟 AUTHENTICATION LOGIC (Firebase)
    // =========================

    setupAuthListener() {
        console.log('Firebase Auth Listener setup.');
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Auth State Changed: User signed in:", user.email);
                this.showVPN();
            } else {
                console.log("Auth State Changed: User signed out.");
                this.showLogin();
            }
        });
    }

    async login(email, password) {
        console.log('Attempting login with:', { email, password });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Login successful:", user.email);
            this.showNotification('Logged in successfully!', 'success');
        } catch (error) {
            console.error("Login failed - Full error:", error);
            const errorCode = error.code;
            const errorMessage = error.message;
            
            // More detailed error messages
            let userFriendlyMessage = 'Login failed: ';
            switch (errorCode) {
                case 'auth/invalid-email':
                    userFriendlyMessage += 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    userFriendlyMessage += 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    userFriendlyMessage += 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    userFriendlyMessage += 'Incorrect password.';
                    break;
                case 'auth/too-many-requests':
                    userFriendlyMessage += 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    userFriendlyMessage += 'Network error. Please check your connection.';
                    break;
                default:
                    userFriendlyMessage += errorMessage || 'An unknown error occurred.';
            }
            
            console.error("Login failed:", errorCode, errorMessage);
            this.showNotification(userFriendlyMessage, 'error');
        }
    }

    async signup(email, password) {
        console.log('Attempting signup with:', { email, password });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Sign up successful:", user.email);
            this.showNotification('Account created successfully!', 'success');
        } catch (error) {
            console.error("Signup failed - Full error:", error);
            const errorCode = error.code;
            const errorMessage = error.message;
            
            // More detailed error messages
            let userFriendlyMessage = 'Sign up failed: ';
            switch (errorCode) {
                case 'auth/email-already-in-use':
                    userFriendlyMessage += 'An account already exists with this email.';
                    break;
                case 'auth/invalid-email':
                    userFriendlyMessage += 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    userFriendlyMessage += 'Email/password accounts are not enabled.';
                    break;
                case 'auth/weak-password':
                    userFriendlyMessage += 'Password is too weak.';
                    break;
                case 'auth/network-request-failed':
                    userFriendlyMessage += 'Network error. Please check your connection.';
                    break;
                default:
                    userFriendlyMessage += errorMessage || 'An unknown error occurred.';
            }
            
            console.error("Sign up failed:", errorCode, errorMessage);
            this.showNotification(userFriendlyMessage, 'error');
        }
    }

    async logout() {
        console.log('Attempting logout...');
        try {
            await signOut(auth);
            console.log("Logout successful.");
            this.showNotification('Logged out successfully!', 'info');
            this.showLogin();
        } catch (error) {
            console.error("Logout failed:", error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    formatAuthError(errorCode) {
        switch(errorCode) {
            case 'auth/invalid-email': return 'Invalid email address.';
            case 'auth/user-disabled': return 'User account disabled.';
            case 'auth/user-not-found': return 'User not found.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'Email already in use.';
            case 'auth/weak-password': return 'Password is too weak.';
            default: return 'An unknown error occurred.';
        }
    }

    // ========================= 
    // 🌟 NOTIFICATIONS (TOASTS)
    // =========================

    showNotification(message, type = 'info') {
        const notificationElement = document.getElementById('notification-toast');
        if (!notificationElement) {
            console.warn('Notification toast element not found.');
            return;
        }

        notificationElement.textContent = message;
        notificationElement.className = `toast show ${type}`;

        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }

    renderServerList() {
        const container = document.getElementById('server-list-container');
        const searchInput = document.getElementById('server-search-input');
        if (!container) return;
        // Clear previous
        container.innerHTML = '';
        // Get search value
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        // Filter servers
        const filtered = SERVER_LIST.filter(s => s.name.toLowerCase().includes(search));
        filtered.forEach(server => {
            const div = document.createElement('div');
            div.className = 'server-item';
            div.innerHTML = `
                <img src="assets/flags/${server.flag}.svg" alt="${server.name} Flag" class="server-flag">
                <span class="server-name">${server.name}</span>
            `;
            div.addEventListener('click', () => {
                this.setSelectedServer(server);
                this.showScreen('vpn-screen');
            });
            container.appendChild(div);
        });
        // Live search
        if (searchInput && !searchInput._bound) {
            searchInput.addEventListener('input', () => this.renderServerList());
            searchInput._bound = true;
        }
    }

    setSelectedServer(server) {
        // Update the main server pill
        const flagImg = document.querySelector('#server-selection-pill .server-flag');
        const nameSpan = document.querySelector('#server-selection-pill .server-name');
        if (flagImg) flagImg.src = `assets/flags/${server.flag}.svg`;
        if (nameSpan) nameSpan.textContent = server.name;
        // Optionally, store selection in localStorage or Firebase for persistence
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: Initializing VPNPopup instance...');
    new VPNPopup();
    // The console.log was removed for a cleaner console
});

// ========================= 
// 🌟 ADDITIONAL ENHANCEMENTS (Auth Form Submissions)
// =========================

document.addEventListener('click', async (e) => {
    if (e.target.matches('.auth-button')) {
        const screen = e.target.closest('.screen');
        const inputs = screen.querySelectorAll('.auth-input');
        
        const email = inputs[0]?.value;
        const password = inputs[1]?.value;

        if (!email || !password) {
            window.vpnApp?.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (screen.id === 'login-screen') {
            await window.vpnApp?.login(email, password);
        } else if (screen.id === 'signup-screen') {
            const confirmPassword = inputs[2]?.value;
            if (password === confirmPassword) {
                await window.vpnApp?.signup(email, password);
            } else {
                window.vpnApp?.showNotification('Passwords do not match', 'error');
            }
        }
    }
});

// Handle premium server clicks (kept for completeness if you re-add premium later)
document.addEventListener('click', (e) => {
    if (e.target.closest('.premium-server')) {
        e.preventDefault();
        window.vpnApp?.showNotification('Premium feature - Upgrade to access premium servers!', 'info');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // No current screen uses a close via escape after server picker removed
        // You can add logic here if other modals are introduced
    }
});