// === NovaVPN Extension: popup.js ===
document.addEventListener('DOMContentLoaded', () => {
  const serverSelect = document.getElementById('serverSelect');
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  const statusIcon = document.getElementById('statusIcon');
  const ipAddress = document.getElementById('ipAddress');
  const serverLocation = document.getElementById('serverLocation');
  const connectionTime = document.getElementById('connectionTime');
  const killSwitchToggle = document.getElementById('killswitchToggle');

  let connected = false;
  let startTime;
  let timerInterval;

  // Load server list
  fetch('../config/servers.json')
    .then(res => res.json())
    .then(servers => {
      serverSelect.innerHTML = '';
      servers.forEach(server => {
        const option = document.createElement('option');
        option.value = server.proxy;
        option.dataset.city = server.city;
        option.textContent = `${server.name} (${server.city})`;
        serverSelect.appendChild(option);
      });
    });

  // Handle toggle connection
  toggleBtn.addEventListener('click', () => {
    if (!connected) {
      const selectedOption = serverSelect.options[serverSelect.selectedIndex];
      const proxy = selectedOption.value;
      const location = selectedOption.dataset.city;

      // Simulate connection
      connected = true;
      updateStatus('Connected', '#14FFEC');
      serverLocation.textContent = location;
      ipAddress.textContent = 'Fetching...';
      fetchIP();
      startTimer();
    } else {
      connected = false;
      updateStatus('Disconnected', '#9BA3AF');
      clearInterval(timerInterval);
      connectionTime.textContent = '00:00';
      ipAddress.textContent = 'N/A';
      serverLocation.textContent = 'N/A';
    }
  });

  // Update status UI
  function updateStatus(text, color) {
    status.textContent = text;
    statusIcon.style.backgroundColor = color;
    toggleBtn.textContent = connected ? 'Disconnect' : 'Connect';
  }

  // Simulate IP fetch (replace with real IP detection if needed)
  function fetchIP() {
    fetch('https://ipinfo.io/json')
      .then(res => res.json())
      .then(data => {
        ipAddress.textContent = data.ip || 'Unavailable';
      })
      .catch(() => ipAddress.textContent = 'Unavailable');
  }

  // Timer for connection duration
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const mins = String(Math.floor(elapsed / 60000)).padStart(2, '0');
      const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
      connectionTime.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  // Kill switch (UI only)
  killSwitchToggle.addEventListener('change', () => {
    console.log('Kill switch toggled:', killSwitchToggle.checked);
    // Future: Apply kill switch logic through proxy settings
  });
});
