// 🚀 DOM Elements
const vpnScreen = document.getElementById('vpn-screen');
const speedTestScreen = document.getElementById('speed-test-screen');
const serverScreen = document.getElementById('server-screen');

// 🌟 Navigation Buttons (dropdown)
const navVpn = document.getElementById('nav-vpn');
const navSpeed = document.getElementById('nav-speed');
const navServers = document.getElementById('nav-servers');

// 🌟 BACK buttons (Top bar BACK SVGs)
const backButtons = document.querySelectorAll('.icon-button-svg');

// 🚀 Function to show screen
function showScreen(screenId) {
    // Hide all screens first
    vpnScreen.classList.add('hidden');
    speedTestScreen.classList.add('hidden');
    serverScreen.classList.add('hidden');

    // Show the selected screen
    document.getElementById(screenId).classList.remove('hidden');
}

// 🚀 Navigation Events (Dropdown items)
if (navVpn) {
    navVpn.addEventListener('click', () => showScreen('vpn-screen'));
}
if (navSpeed) {
    navSpeed.addEventListener('click', () => showScreen('speed-test-screen'));
}
if (navServers) {
    navServers.addEventListener('click', () => showScreen('server-screen'));
}

// 🚀 BACK Button → always return to VPN screen
backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('vpn-screen');
    });
});

// 🚀 LOG to confirm working
console.log('popup.js loaded — screen transitions ready 🚀');
