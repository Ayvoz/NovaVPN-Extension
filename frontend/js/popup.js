document.addEventListener("DOMContentLoaded", () => {

    // Screens
    const vpnScreen = document.getElementById("vpn-screen");
    const loginScreen = document.getElementById("login-screen");
    const signupScreen = document.getElementById("signup-screen");
    const settingsScreen = document.getElementById("settings-screen");

    // Buttons
    const loginButton = loginScreen.querySelector(".auth-button");
    const signupButton = signupScreen.querySelector(".auth-button");
    const goSignup = document.getElementById("go-signup");
    const goLogin = document.getElementById("go-login");
    const settingsButton = document.getElementById("vpn-settings");
    const backToVpnBtn = document.getElementById("back-to-vpn");
    const logoutButton = document.getElementById("logout-button");

    // Server Picker elements
    const serverPicker = document.getElementById('server-picker');
    const closeServerPickerBtn = document.getElementById('close-server-picker');
    const currentServerArrow = document.querySelector('#vpn-server-pill .vpn-server-arrow');
    const currentServerText = document.querySelector('#vpn-server-pill .vpn-server-text');
    const serverItems = document.querySelectorAll('.server-item');

    // INITIAL LOAD → check login
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        showScreen("vpn-screen");
    } else {
        showScreen("login-screen");
    }

    // LOGIN
    loginButton.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("plan", "free");
        showScreen("vpn-screen");
    });

    // SIGNUP
    signupButton.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("plan", "free");
        showScreen("vpn-screen");
    });

    // Switch to Signup
    goSignup.addEventListener("click", () => {
        showScreen("signup-screen");
    });

    // Switch to Login
    goLogin.addEventListener("click", () => {
        showScreen("login-screen");
    });

    // Open Settings
    settingsButton.addEventListener("click", () => {
        showScreen("settings-screen");
    });

    // Back to VPN from Settings
    backToVpnBtn.addEventListener("click", () => {
        showScreen("vpn-screen");
    });

    // LOGOUT
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("plan");
        showScreen("login-screen");
    });

    // OPEN server picker
    currentServerArrow.addEventListener('click', () => {
        serverPicker.classList.remove('hidden');
    });

    // CLOSE server picker
    closeServerPickerBtn.addEventListener('click', () => {
        serverPicker.classList.add('hidden');
    });

    // SELECT server
    serverItems.forEach(item => {
        item.addEventListener('click', () => {
            const serverName = item.getAttribute('data-server');
            currentServerText.textContent = serverName;
            localStorage.setItem('selectedServer', serverName);
            serverPicker.classList.add('hidden');
        });
    });

    // Restore selected server
    const savedServer = localStorage.getItem('selectedServer');
    if (savedServer) {
        currentServerText.textContent = savedServer;
    }

});

// REUSABLE SCREEN SWITCH FUNCTION
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}
// LIVE SEARCH
const serverSearchInput = document.getElementById('server-search');
serverSearchInput.addEventListener('input', () => {
    const filter = serverSearchInput.value.toLowerCase();
    document.querySelectorAll('.server-item').forEach(item => {
        const text = item.querySelector('.server-name').textContent.toLowerCase();
        if (text.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});
