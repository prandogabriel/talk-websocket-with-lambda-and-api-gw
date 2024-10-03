let socket;
let currentRoom = "chatEvent"; // Default room key
let currentNickname;

function joinRoom() {
  const nickName = document.getElementById("nickName").value;
  if (!nickName) {
    alert("Please enter a nickname");
    return;
  }
  currentNickname = nickName;

  socket = new WebSocket(
    "wss://4a7ipl75i0.execute-api.us-east-1.amazonaws.com/dev/"
  );

  socket.onopen = function (event) {
    // Send join room message immediately after connection
    const joinMessage = JSON.stringify({
      action: "joinroom",
      roomKey: currentRoom,
      nickName: nickName,
    });
    socket.send(joinMessage);
    log(`Connected to WebSocket, you joined as ${nickName}`, "system");

    // Switch from join section to chat section
    document.getElementById("joinSection").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("joinSection").style.display = "none";
      document.getElementById("chatSection").style.display = "block";
      setTimeout(() => {
        document.getElementById("chatSection").style.opacity = "1";
      }, 50);
    }, 500);
  };

  socket.onmessage = function (event) {
    console.log("Received message:", event.data); // For debugging
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error("Error parsing message:", error);
      log(event.data, "system");
    }
  };

  socket.onclose = function (event) {
    log("WebSocket connection closed", "system");
  };
}

function handleMessage(data) {
  if (data.action === "sendmessage") {
    const sender = data.nickName || "Anonymous";
    log(
      `${sender}: ${data.content}`,
      sender === currentNickname ? "sent" : "received"
    );
  } else if (data.action === "joinroom") {
    log(`${data.nickName} joined the room`, "system");
  } else {
    log(JSON.stringify(data), "system");
  }
}

function sendMessage() {
  const content = document.getElementById("messageInput").value;

  if (!content.trim()) {
    return; // Don't send empty messages
  }

  const message = JSON.stringify({
    action: "sendmessage",
    roomKey: currentRoom,
    nickName: currentNickname,
    content: content,
  });

  socket.send(message);
  document.getElementById("messageInput").value = "";
}

function log(message, type) {
  const chatLog = document.getElementById("chatLog");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  if (type === "sent") {
    messageElement.classList.add("sent");
  } else if (type === "system") {
    messageElement.classList.add("system");
  }
  messageElement.textContent = message;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Add event listener for Enter key on message input
document
  .getElementById("messageInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

// Add event listener for Enter key on nickname input
document
  .getElementById("nickName")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      joinRoom();
    }
  });
