// 🚀 popup.js → FINAL VERSION (Login + Signup + VPN + Settings + Back + Logout)

document.addEventListener("DOMContentLoaded", () => {

    // Elements
    const vpnScreen = document.getElementById("vpn-screen");
    const loginScreen = document.getElementById("login-screen");
    const signupScreen = document.getElementById("signup-screen");
    const settingsScreen = document.getElementById("settings-screen");

    const loginButton = loginScreen.querySelector(".auth-button");
    const signupButton = signupScreen.querySelector(".auth-button");

    const goSignup = document.getElementById("go-signup");
    const goLogin = document.getElementById("go-login");

    const logoutButton = document.getElementById("logout-button");

    const settingsButton = document.getElementById("vpn-settings");

    const backToVpnBtn = document.getElementById("back-to-vpn");

    // 🚀 INITIAL LOAD → check login
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        showScreen("vpn-screen");
    } else {
        showScreen("login-screen");
    }

    // 🚀 LOGIN
    loginButton.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("plan", "free");
        showScreen("vpn-screen");
    });

    // 🚀 SIGNUP
    signupButton.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("plan", "free");
        showScreen("vpn-screen");
    });

    // 🚀 GO TO SIGNUP
    goSignup.addEventListener("click", () => {
        showScreen("signup-screen");
    });

    // 🚀 GO TO LOGIN
    goLogin.addEventListener("click", () => {
        showScreen("login-screen");
    });

    // 🚀 OPEN SETTINGS
    settingsButton.addEventListener("click", () => {
        showScreen("settings-screen");
        updateSettingsScreen(); // if you have premium lock logic
    });

    // 🚀 BACK TO VPN FROM SETTINGS
    if (backToVpnBtn) {
        backToVpnBtn.addEventListener("click", () => {
            showScreen("vpn-screen");
        });
    }

    // 🚀 LOGOUT
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("plan");
        showScreen("login-screen");
    });

});

// 🚀 REUSABLE SCREEN SWITCH FUNCTION
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}
