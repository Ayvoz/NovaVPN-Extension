const { database } = require('../config/firebase');

// Start a session and store session details in Realtime Database
exports.startSession = async (req, res) => {
  const { user_id, server_ip, start_time } = req.body;

  try {
    // Create a session object to store in Realtime Database
    const sessionData = {
      user_id,
      server_ip,
      start_time,
      status: 'active',  // Could track the status of the session (active/inactive)
    };

    // Push session data to the Realtime Database under 'sessions' node
    const sessionRef = await database.ref('sessions').push(sessionData);

    // Return the session ID from Realtime Database
    res.status(201).json({ sessionId: sessionRef.key, message: 'Session started' });
  } catch (error) {
    console.error("Error starting session: ", error);
    res.status(400).json({ message: 'Error starting session' });
  }
};
