// popup.js
import { servers } from './servers.js';

// === Screen Switching ===

const vpnScreen = document.getElementById('vpn-screen');
const speedScreen = document.getElementById('speed-test-screen');
const serverScreen = document.getElementById('server-list-screen');

document.getElementById('nav-vpn').addEventListener('click', () => showScreen(vpnScreen));
document.getElementById('nav-speed').addEventListener('click', () => showScreen(speedScreen));
document.getElementById('nav-servers').addEventListener('click', () => showScreen(serverScreen));

document.getElementById('vpn-back').addEventListener('click', () => showScreen(vpnScreen));
document.getElementById('speed-back').addEventListener('click', () => showScreen(vpnScreen));
document.getElementById('server-back').addEventListener('click', () => showScreen(vpnScreen));

function showScreen(screen) {
    [vpnScreen, speedScreen, serverScreen].forEach(s => {
        s.classList.add('hidden');
    });

    screen.classList.remove('hidden');
    screen.style.display = 'flex';
}

// === VPN Start/Stop Logic ===

let vpnConnected = false;
let vpnTimerInterval;
let vpnSeconds = 0;

const startButton = document.getElementById('vpn-start-button');
const timerDisplay = document.getElementById('vpn-timer');
const speedDisplay = document.getElementById('vpn-speed');

startButton.addEventListener('click', () => {
    vpnConnected = !vpnConnected;

    if (vpnConnected) {
        startButton.textContent = 'STOP';
        document.getElementById('vpn-speed-ring').classList.add('connected-ring');

        startVpnTimer();
        startSpeedSimulation();

        // TODO: Tell background.js to start VPN connection
    } else {
        startButton.textContent = 'START';
        document.getElementById('vpn-speed-ring').classList.remove('connected-ring');

        stopVpnTimer();
        resetSpeed();

        // TODO: Tell background.js to stop VPN connection
    }
});

function startVpnTimer() {
    vpnSeconds = 0;
    vpnTimerInterval = setInterval(() => {
        vpnSeconds++;
        timerDisplay.textContent = formatTime(vpnSeconds);
    }, 1000);
}

function stopVpnTimer() {
    clearInterval(vpnTimerInterval);
}

function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function startSpeedSimulation() {
    // Dummy speed simulator — replace with real data later
    let currentSpeed = 0;
    const speedInterval = setInterval(() => {
        if (!vpnConnected) {
            clearInterval(speedInterval);
            return;
        }
        currentSpeed = Math.min(currentSpeed + Math.random() * 5, 75);
        speedDisplay.textContent = `${currentSpeed.toFixed(1)} mb/s`;
    }, 1000);
}

function resetSpeed() {
    speedDisplay.textContent = '0 mb/s';
}

// === Server List Population ===

const serverListContainer = document.getElementById('server-list');

function populateServerList() {
    serverListContainer.innerHTML = '';

    servers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';

        const flagImg = document.createElement('img');
        flagImg.src = server.flag;
        flagImg.className = 'flag';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'server-info';
        infoDiv.innerHTML = `
            <div class="server-name">${server.city}, ${server.country}</div>
            <div class="server-locations">${server.locations} Locations</div>
            <div class="server-latency">${server.latency} ms</div>
        `;

        const signalDiv = document.createElement('div');
        signalDiv.className = 'server-signal';
        signalDiv.textContent = '📶📶📶';

        const connectBtn = document.createElement('button');
        connectBtn.className = 'connect-button';
        connectBtn.textContent = 'CONNECT';

        // Connect button logic
        connectBtn.addEventListener('click', () => {
            document.getElementById('vpn-current-server').textContent = `${server.city}, ${server.country}`;
            showScreen(vpnScreen);
        });

        serverItem.appendChild(flagImg);
        serverItem.appendChild(infoDiv);
        serverItem.appendChild(signalDiv);
        serverItem.appendChild(connectBtn);

        // Premium badge
        if (server.premium) {
            const premiumBadge = document.createElement('img');
            premiumBadge.src = 'assets/icons/crown.svg';
            premiumBadge.className = 'premium-badge';
            serverItem.appendChild(premiumBadge);
        }

        serverListContainer.appendChild(serverItem);
    });
}

// === Active Flag Highlight ===

function setupFlagSelection() {
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', () => {
            document.querySelectorAll('.flag').forEach(f => f.classList.remove('active-flag'));
            flag.classList.add('active-flag');

            // Set current server name based on flag
            const country = flag.getAttribute('data-country');
            document.getElementById('vpn-current-server').textContent = country;
        });
    });
}

// === INIT ===

document.addEventListener('DOMContentLoaded', () => {
    populateServerList();
    setupFlagSelection();
});
