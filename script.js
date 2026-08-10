// ===================================
// AI BROTHER v3
// Initialization
// ===================================

// Dashboard Protection
const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    alert("Please login first!");
    window.location.href = "login.html";
}

const user = JSON.parse(localStorage.getItem("user")) || {};

const userName = user.name || "Guest";
const userEmail = user.email || "";

// ===================================
// USER-SPECIFIC STORAGE KEYS
// ===================================

const CHAT_STORAGE_KEY =
    "aiBrotherChats_" + userEmail.toLowerCase();

const CURRENT_CHAT_KEY =
    "currentChat_" + userEmail.toLowerCase();

const DATABASE_CHAT_KEY =
    "databaseChatId_" + userEmail.toLowerCase();

// Update Profile
document.getElementById("username").textContent = userName;

document.getElementById("welcome-message").textContent =
`👋 Hello, ${userName}`;

document.getElementById("profile-letter").textContent =
userName.charAt(0).toUpperCase();

// ===================================
// Chat Storage
// ===================================

let chats =
    JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || {};


// -----------------------------------
// Current Chat
// -----------------------------------

let currentChat =
    localStorage.getItem(CURRENT_CHAT_KEY);


// If saved chat does not exist,
// select the first available chat.

if (!currentChat || !chats[currentChat]) {

    const chatNames = Object.keys(chats);

    if (chatNames.length > 0) {

        currentChat = chatNames[0];

    } else {

        currentChat = "New Chat 1";

        chats[currentChat] = [];

    }

}


// Save active chat

localStorage.setItem(
    CURRENT_CHAT_KEY,
    currentChat
);
// ===================================
// CONNECT CURRENT CHAT TO DATABASE
// ===================================

async function ensureDatabaseChat() {

    const existingId =
        localStorage.getItem(DATABASE_CHAT_KEY);

    // Already connected
    if (existingId) {

        console.log(
            "Using existing database chat:",
            existingId
        );

        return Number(existingId);
    }

    // Create database chat
    const databaseChatId =
        await createDatabaseChat();

    if (databaseChatId) {

        console.log(
            "Current chat connected to database:",
            databaseChatId
        );

        return Number(databaseChatId);
    }

    return null;
}


// Save chats

localStorage.setItem(
    CHAT_STORAGE_KEY,
    JSON.stringify(chats)
);

// ===================================
// Elements
// ===================================

const chatBox =
document.getElementById("chat-box");

const userInput =
document.getElementById("user-input");

const sendBtn =
document.getElementById("send-btn");
const stopBtn =
document.getElementById("stop-btn");


// ===================================
// STOP AI GENERATION
// ===================================

stopBtn.addEventListener("click", function () {

    stopGeneration = true;

    stopBtn.style.display = "none";

    removeTyping();

    console.log("⏹ AI generation stopped.");

});

const chatList =
document.getElementById("chat-list");

const newChatBtn =
document.getElementById("new-chat-btn");

const searchInput =
document.querySelector(".search-box input");

// ===================================
// Time
// ===================================

function getTime(){

    return new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}
// ===================================
// Typing Animation
// ===================================

function showTyping(){

    const typing=document.createElement("div");

    typing.className="typing";

    typing.id="typing";

    typing.innerHTML=`

        <span></span>

        <span></span>

        <span></span>

    `;

    chatBox.appendChild(typing);

    chatBox.scrollTop=chatBox.scrollHeight;

}

function removeTyping(){

    const typing=document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

// ===================================
// Add User Message
// ===================================

function addUserMessage(text){

    const message=document.createElement("div");

    message.className="user-message";

    message.innerHTML=`

        <div class="message-content">

            ${text}

        </div>

        <div class="message-footer">

            <button class="edit-btn">
                ✏️ Edit
            </button>

            <span class="time">

                ${getTime()}

            </span>

        </div>

    `;

    chatBox.appendChild(message);

    chatBox.scrollTop=chatBox.scrollHeight;

    chats[currentChat].push({

        sender:"user",

        message:text,

        time:getTime()

    });

    localStorage.setItem(

        CHAT_STORAGE_KEY,

        JSON.stringify(chats)

    );

}

// ===================================
// AI Typing Reply
// ===================================

async function typeReply(text, chatName){

    const message = document.createElement("div");

    message.className = "bot-message";

    message.innerHTML = `

        <div class="message-content"></div>

        <div class="message-footer">

            <button class="copy-btn">
                📋 Copy
            </button>

            <button class="regen-btn">
                🔄 Regenerate
            </button>

            <span class="time">
                ${getTime()}
            </span>

        </div>

    `;

    chatBox.appendChild(message);

    const content =
        message.querySelector(".message-content");

    stopGeneration = false;

    stopBtn.style.display = "inline-block";

    for(let i = 0; i < text.length; i++){

        if(stopGeneration){
            break;
        }

        content.textContent += text.charAt(i);

        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve =>
            setTimeout(resolve, 15)
        );
    }

    stopBtn.style.display = "none";

    // IMPORTANT:
    // Save response to the SAME chat
    // that started this request.

    if(!chats[chatName]){
        chats[chatName] = [];
    }

    chats[chatName].push({

        sender: "bot",

        message: text,

        time: getTime()

    });

    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chats)
    );

    renderChatList();
}
// ===================================
// Send Message
// ===================================

// ===================================
// Send Message - Stable Version
// ===================================

let aiGenerating = false;

async function sendMessage() {

    // Prevent duplicate requests
    if (aiGenerating) {
        return;
    }

    const message = userInput.value.trim();
    // ==========================================
// 8.5 - Upload selected file when sending
// ==========================================

// ==========================================
// 8.5 - Upload selected file when sending
// ==========================================

let uploadedFile = null;

if (selectedFile) {

    try {

        console.log(
            "📤 Uploading:",
            selectedFile.name
        );

        const fileToUpload = selectedFile;

        const formData = new FormData();

        formData.append(
            "file",
            fileToUpload
        );

        const uploadResponse = await fetch(
            "https://ai-brother-backend.onrender.com/upload-file",
            {
                method: "POST",
                body: formData
            }
        );

        const uploadData =
            await uploadResponse.json();

        console.log(
            "📤 Upload response:",
            uploadData
        );

        if (!uploadResponse.ok) {

            throw new Error(
                uploadData.detail ||
                "File upload failed"
            );

        }

        uploadedFile = {

            name: fileToUpload.name,

            type: fileToUpload.type,

            size: fileToUpload.size

        };

        console.log(
            "✅ File uploaded successfully:",
            uploadedFile.name
        );

        
    }

    catch (error) {

        console.error(
            "❌ File upload error:",
            error
        );

        showToast(
            "❌ File upload failed"
        );

        return;

    }

}

// Allow sending if either message OR file exists
if (message === "" && !selectedFile) {
    return;
}

    // 🔒 Permanently remember which chat started this request
    const chatName = currentChat;
    let databaseChatId =
    localStorage.getItem(DATABASE_CHAT_KEY);

if (databaseChatId) {
    databaseChatId = Number(databaseChatId);
}
    

    // Make sure chat still exists
    if (!chats[chatName]) {
        chats[chatName] = [];
    }

    // Lock AI generation
    aiGenerating = true;

    // Save user message
    const userChatMessage = {
        sender: "user",
        message: message,
        time: getTime()
    };

    chats[chatName].push(userChatMessage);

    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chats)
    );

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        chatName
    );

    // Display user message
    const userMessage = document.createElement("div");

    userMessage.className = "user-message";

    userMessage.innerHTML = `
        <div class="message-content">
            ${message}
        </div>

        <div class="message-footer">

            <button class="edit-btn">
                ✏️ Edit
            </button>

            <span class="time">
                ${getTime()}
            </span>

        </div>
    `;

    chatBox.appendChild(userMessage);

    chatBox.scrollTop = chatBox.scrollHeight;
    // Clear input
userInput.value = "";

// ==========================================
// SHOW UPLOADED FILE IN CHAT
// ==========================================

if (uploadedFile) {

    const fileMessage =
        document.createElement("div");

    fileMessage.className =
        "user-message";

    fileMessage.innerHTML = `

        <div class="message-content">

            📎 <strong>
                ${uploadedFile.name}
            </strong>

            <div style="
                font-size:12px;
                opacity:0.7;
                margin-top:4px;
            ">

                ✅ Uploaded successfully

            </div>

        </div>

        <div class="message-footer">

            <span class="time">
                ${getTime()}
            </span>

        </div>

    `;

    chatBox.appendChild(fileMessage);

    chatBox.scrollTop =
        chatBox.scrollHeight;

}

// Show typing
showTyping();

    try {

        console.log("Sending message to chat:", chatName);

        const response = await fetch(
            "https://ai-brother-backend.onrender.com/chat",
            
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

body: JSON.stringify({

    message: message,

    email: userEmail,

    chat_id: databaseChatId

})
            }
        );

        console.log(
            "Backend response status:",
            response.status
        );

        // Get backend response
        const data = await response.json();

        removeTyping();

        // Backend error
        if (!response.ok) {

            console.error(
                "Backend error:",
                data
            );

            let errorMessage =
                "❌ AI Brother could not generate a response.";

            if (response.status === 503) {

                errorMessage =
                    "⚠️ Gemini is temporarily busy. Please try again in a few seconds.";
            }

            else if (response.status === 429) {

                errorMessage =
                    "⚠️ Too many requests. Please wait a moment and try again.";
            }

            else if (data.detail) {

                errorMessage =
                    "❌ " + data.detail;
            }

            await typeReply(
                errorMessage,
                chatName
            );

            return;
        }

        // Successful Gemini response
        await typeReply(
            data.reply,
            chatName
        );

    }

    catch (error) {

        console.error(
            "Gemini connection error:",
            error
        );

        removeTyping();

        await typeReply(
            "❌ Cannot connect to AI Brother backend. Please make sure FastAPI is running.",
            chatName
        );

    }

    finally {

    aiGenerating = false;

    // Keep the exact chat where the question was asked
    currentChat = chatName;

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        chatName
    );

    // DO NOT create or switch to a new chat
    renderChatList();
}
}
// ===================================
// Load Chat History
// ===================================

function loadChatHistory(){

    chatBox.innerHTML="";

    if(!chats[currentChat] || chats[currentChat].length===0){

        chatBox.innerHTML = `

<div class="welcome">

    <div class="welcome-icon">
        🤖
    </div>

    <h1 id="welcome-message">
        AI Brother
    </h1>

    <p>
        Your Personal AI Assistant
    </p>

    <div class="suggestions">

        <button class="suggest-btn">
            💻 Coding
        </button>

        <button class="suggest-btn">
            📚 AI
        </button>

        <button class="suggest-btn">
            🚀 Projects
        </button>

        <button class="suggest-btn">
            💼 Placements
        </button>

    </div>

</div>

`;

        return;

    }

    chats[currentChat].forEach(chat=>{

        if(chat.sender==="user"){

            addUserHistory(chat);

        }

        else{

            addBotHistory(chat);

        }

    });

}

// ===================================
// User History Message
// ===================================

function addUserHistory(chat){

    const message=document.createElement("div");

    message.className="user-message";

    message.innerHTML=`

        <div class="message-content">

            ${chat.message}

        </div>

        <div class="message-footer">

            <button class="edit-btn">

                ✏️ Edit

            </button>

            <span class="time">

                ${chat.time}

            </span>

        </div>

    `;

    chatBox.appendChild(message);

}

// ===================================
// Bot History Message
// ===================================

function addBotHistory(chat){

    const message=document.createElement("div");

    message.className="bot-message";

    message.innerHTML=`

        <div class="message-content">

            ${chat.message}

        </div>

        <div class="message-footer">

            <button class="copy-btn">

                📋 Copy

            </button>

            <button class="regen-btn">

                🔄 Regenerate

            </button>

            <span class="time">

                ${chat.time}

            </span>

        </div>

    `;

    chatBox.appendChild(message);

}

// ===================================
// Render Chat List
// ===================================

function renderChatList(){

    chatList.innerHTML = "";

    Object.keys(chats).forEach(chatName=>{

        const item = document.createElement("div");

        item.className = "history-item";
        const menuBtn = document.createElement("span");

menuBtn.className = "chat-menu";

menuBtn.innerHTML = "⋮";

        if(chatName===currentChat){

            item.style.background="#2563EB";

        }

        item.innerHTML = `
            <span class="chat-title">
                💬 ${chatName}
            </span>

<span class="chat-delete">
    🗑
</span>
        `;
        item.appendChild(menuBtn);

        // Open Chat
        item.querySelector(".chat-title").onclick=function(){

    currentChat = chatName;

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        currentChat
    );

    renderChatList();

    loadChatHistory();

};
        menuBtn.onclick = function(e){

    e.stopPropagation();

    const action = prompt(

`1 = Rename
2 = Delete
3 = Export`

    );

    if(action==="1"){

        item.ondblclick();

    }

    else if(action==="2"){

        if(confirm("Delete this chat?")){

            delete chats[chatName];

            if(Object.keys(chats).length===0){

                chats["New Chat"] = [];

            }

            currentChat = Object.keys(chats)[0];

            localStorage.setItem(
                CHAT_STORAGE_KEY,
                JSON.stringify(chats)
            );

            renderChatList();

            loadChatHistory();

        }

    }

    else if(action==="3"){

        let text="";

        chats[chatName].forEach(chat=>{

            text += chat.sender + ": " + chat.message + "\n\n";

        });

        const blob = new Blob([text], {type:"text/plain"});

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = chatName + ".txt";

        link.click();

    }

};
        item.ondblclick = function(){

    const newName = prompt("Rename this chat:", chatName);

    if(!newName) return;

    if(chats[newName]){

        showToast("⚠️ Chat already exists!");

        return;

    }

    chats[newName] = chats[chatName];

    delete chats[chatName];

    currentChat = newName;

    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chats)
    );

    renderChatList();

};
        // Delete Chat
        item.querySelector(".chat-delete").onclick=function(e){

            e.stopPropagation();

            if(!confirm("Delete this chat?")) return;

            delete chats[chatName];

            if(Object.keys(chats).length===0){

                chats["New Chat 1"] = [];

            }

            currentChat = Object.keys(chats)[0];

            localStorage.setItem(
                CHAT_STORAGE_KEY,
                JSON.stringify(chats)
            );

            renderChatList();

            loadChatHistory();

        };

        chatList.appendChild(item);

    });

}
// ===================================
// New Chat
// ===================================

// ===================================
// New Chat
// ===================================

newChatBtn.addEventListener("click", async () => {

    // Create local chat name
    let count = Object.keys(chats).length + 1;

    let newChatName = `New Chat ${count}`;

    while (chats[newChatName]) {

        count++;

        newChatName = `New Chat ${count}`;

    }

    // Create local chat
    currentChat = newChatName;

    chats[currentChat] = [];

    // Save local chat
    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chats)
    );

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        currentChat
    );

    // Create matching database chat
    const databaseChatId =
        await createDatabaseChat();

    if (databaseChatId) {

        console.log(
            "New database chat created:",
            databaseChatId
        );

    }

    // Refresh UI
    renderChatList();

    loadChatHistory();

});
// ===================================
// DATABASE CHAT CREATION
// ===================================

async function createDatabaseChat() {

    try {

        const response = await fetch(
            "https://ai-brother-backend.onrender.com/new_chat",
            
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: userEmail
                })
            }
        );

        if (!response.ok) {

            console.error(
                "Failed to create database chat:",
                response.status
            );

            return null;
        }

        const data = await response.json();

        if (data.success && data.chat) {

            localStorage.setItem(
                DATABASE_CHAT_KEY,
                data.chat.id
            );

            console.log(
                "Database Chat ID:",
                data.chat.id
            );

            return data.chat.id;
        }

        return null;

    }

    catch (error) {

        console.error(
            "Database chat creation error:",
            error
        );

        return null;
    }
}
// ===================================
// Send Button
// ===================================

sendBtn.addEventListener("click", sendMessage);

// ===================================
// Enter / Shift + Enter
// ===================================

userInput.addEventListener("keydown", function (e) {

    // Enter = Send
    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

    // Shift + Enter = New Line
    if (e.key === "Enter" && e.shiftKey) {

        // Allow normal newline
        return;

    }

});

// ===================================
// Search Chats
// ===================================

searchInput.addEventListener("input", function () {

    const keyword = this.value.toLowerCase();

    const items = document.querySelectorAll(".history-item");

    items.forEach(item => {

        if (item.textContent.toLowerCase().includes(keyword)) {

            item.style.display = "block";

        } else {

            item.style.display = "none";

        }

    });

});

// ===================================
// Logout
// ===================================

document
.getElementById("logout-btn")
.addEventListener("click", function () {

    if (!confirm("Logout from AI Brother?")) return;

    localStorage.removeItem("isLoggedIn");

    window.location.href = "login.html";

});

// ===================================
// Copy & Regenerate Buttons
// ===================================

document.addEventListener("click", function (e) {

    // Copy
    if (e.target.classList.contains("copy-btn")) {

        const text =
            e.target
            .closest(".bot-message")
            .querySelector(".message-content")
            .innerText;

        navigator.clipboard.writeText(text);

        e.target.innerHTML = "✅ Copied";

        setTimeout(() => {

            e.target.innerHTML = "📋 Copy";

        }, 1500);

    }

    // Regenerate
    // Regenerate

// Regenerate

if (e.target.classList.contains("regen-btn")) {

    const chat = chats[currentChat];

    if (!chat || chat.length === 0) {

        showToast("⚠️ No message to regenerate.");

        return;

    }

    // Find the latest user question
    let lastUserMessage = null;

    for (let i = chat.length - 1; i >= 0; i--) {

        if (chat[i].sender === "user") {

            lastUserMessage = chat[i].message;

            break;

        }

    }

    if (!lastUserMessage) {

        showToast("⚠️ No user message found.");

        return;

    }

    showToast("🔄 Regenerating...");

    console.log(
        "Regenerating question:",
        lastUserMessage
    );

}

});

// ===================================
// Initial Load
// ===================================

renderChatList();

loadChatHistory();
const themeBtn =
document.getElementById("theme-btn");

themeBtn.onclick=function(){

    document.body.classList.toggle("light");

    localStorage.setItem(

        "theme",

        document.body.classList.contains("light")

    );

}

if(localStorage.getItem("theme")==="true"){

    document.body.classList.add("light");

}
const micBtn = document.getElementById("mic-btn");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.continuous = false;

    micBtn.addEventListener("click", function () {

        recognition.start();

    });

    recognition.onresult = function (event) {

        userInput.value = event.results[0][0].transcript;

    };

}
const exportBtn = document.getElementById("export-btn");

exportBtn.addEventListener("click", function(){

    let text = "";

    if(chats[currentChat]){

        chats[currentChat].forEach(chat => {

            text +=
`${chat.sender.toUpperCase()}
${chat.message}

`;

        });

    }

    const blob = new Blob([text], {type:"text/plain"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = currentChat + ".txt";

    link.click();

});
const settingsBtn=document.getElementById("settings-btn");

const settingsPanel=document.getElementById("settings-panel");

settingsBtn.onclick=function(){

settingsPanel.style.display=

settingsPanel.style.display==="block"

?"none":"block";

}
document.getElementById("clear-chat-btn").addEventListener("click", function () {

    if (!confirm("Are you sure you want to clear this chat?")) return;

    // Clear current chat
    chats[currentChat] = [];

    // Save changes
    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chats)
    );

    // Reload chat area
    loadChatHistory();

    // Close settings panel
    settingsPanel.style.display = "none";

});
document.getElementById("about-btn").addEventListener("click", function () {

    settingsPanel.style.display = "none";

    alert(`🤖 AI Brother

Version : 1.0

Created by : Sujju

Frontend :
HTML • CSS • JavaScript

Backend :
FastAPI

Features :
✅ AI Chat
✅ Chat History
✅ Export Chat
✅ Dark / Light Mode
✅ Settings Panel

© 2026 AI Brother`);

});
function showToast(message) {

    let toast = document.getElementById("toast");

    // Create toast element if it doesn't exist
    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.right = "30px";
        toast.style.padding = "12px 18px";
        toast.style.background = "#222";
        toast.style.color = "#fff";
        toast.style.borderRadius = "10px";
        toast.style.zIndex = "99999";
        toast.style.fontSize = "14px";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {

        toast.style.display = "none";

    }, 3000);
}
// ===================================
// Suggestion Buttons
// ===================================

document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("suggest-btn")) {
        return;
    }

    const buttonText = e.target.innerText;

    if (buttonText.includes("Coding")) {

        userInput.value =
            "Explain Python functions with a simple example.";

    }

    else if (buttonText.includes("AI")) {

        userInput.value =
            "What is Artificial Intelligence? Explain it simply.";

    }

    else if (buttonText.includes("Projects")) {

        userInput.value =
            "Give me some good CSE project ideas.";

    }

    else if (buttonText.includes("Placements")) {

        userInput.value =
            "How should I prepare for CSE placements?";

    }

    userInput.focus();

});
// ===================================
// 7.6 - Auto Scroll
// ===================================

function scrollToLatestMessage() {

    if (chatBox) {

        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: "smooth"
        });

    }

}
// ===================================
// 8.1 - File Upload
// ===================================
// ===================================
// 8.3 - Upload File to Backend
// ===================================

// ===================================
// 8.4 - File Preview Before Upload
// ===================================

let selectedFile = null;

const fileUpload = document.getElementById("file-upload");

if (fileUpload) {

    fileUpload.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        selectedFile = file;

        showFilePreview(file);

        // Allow selecting the same file again later
        this.value = "";

    });
}

// ===================================
// Prevent Chat Form Page Refresh
// ===================================

const chatForm = document.getElementById("chat-form");

if (chatForm) {

    chatForm.addEventListener("submit", function (e) {

        e.preventDefault();

    });

}
function showFilePreview(file) {

    let preview = document.getElementById("file-preview");

    // Remove old preview
    if (preview) {
        preview.remove();
    }

    preview = document.createElement("div");

    preview.id = "file-preview";

    preview.style.display = "flex";
    preview.style.alignItems = "center";
    preview.style.gap = "12px";
    preview.style.padding = "8px 12px";
    preview.style.margin = "0 12px 8px 12px";
    preview.style.background = "#f1f5f9";
    preview.style.color = "#1f2937";
    preview.style.border = "1px solid #d1d5db";
    preview.style.borderRadius = "12px";
    preview.style.minHeight = "65px";
    preview.style.boxSizing = "border-box";

    // ==========================================
    // IMAGE THUMBNAIL
    // ==========================================

    if (file.type.startsWith("image/")) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(file);

        image.alt = file.name;

        image.style.width = "55px";
        image.style.height = "55px";
        image.style.objectFit = "cover";
        image.style.borderRadius = "8px";
        image.style.cursor = "pointer";
        image.style.border = "1px solid #ccc";

        // Open large preview
        image.addEventListener("click", function () {

            const overlay = document.createElement("div");

            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.background = "rgba(0,0,0,0.85)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.zIndex = "99999";
            overlay.style.cursor = "pointer";

            const largeImage =
                document.createElement("img");

            largeImage.src = image.src;

            largeImage.style.maxWidth = "90vw";
            largeImage.style.maxHeight = "85vh";
            largeImage.style.objectFit = "contain";
            largeImage.style.borderRadius = "12px";

            overlay.appendChild(largeImage);

            overlay.addEventListener("click", function () {
                overlay.remove();
            });

            document.body.appendChild(overlay);
        });

        preview.appendChild(image);

    } else {

        // PDF / DOC / TXT
        const icon = document.createElement("div");

        icon.textContent = "📄";
        icon.style.fontSize = "32px";

        preview.appendChild(icon);
    }

    // ==========================================
    // FILE INFORMATION
    // ==========================================

    const info = document.createElement("div");

    info.style.flex = "1";
    info.style.minWidth = "0";

    const name = document.createElement("div");

    name.textContent = file.name;

    name.style.fontWeight = "600";
    name.style.color = "#1f2937";
    name.style.overflow = "hidden";
    name.style.textOverflow = "ellipsis";
    name.style.whiteSpace = "nowrap";

    const size = document.createElement("small");

    size.textContent =
        (file.size / 1024).toFixed(1) + " KB";

    size.style.color = "#6b7280";

    info.appendChild(name);
    info.appendChild(size);

    preview.appendChild(info);

    // ==========================================
    // REMOVE BUTTON
    // ==========================================

    const removeButton =
        document.createElement("button");

    removeButton.type = "button";

    removeButton.textContent = "✕";

    removeButton.style.border = "none";
    removeButton.style.background = "transparent";
    removeButton.style.color = "#111827";
    removeButton.style.cursor = "pointer";
    removeButton.style.fontSize = "20px";
    removeButton.style.padding = "5px";

    removeButton.addEventListener(
        "click",
        function () {

            selectedFile = null;

            preview.remove();

            console.log("File removed");
        }
    );

    preview.appendChild(removeButton);

    // ==========================================
    // PUT PREVIEW ABOVE INPUT
    // ==========================================

    const inputArea =
        document.querySelector(".input-area");

    if (inputArea) {

        inputArea.parentNode.insertBefore(
            preview,
            inputArea
        );

    } else {

        console.error(
            "Input area not found."
        );
    }
}
// ==========================================
// Convert selected file to Base64
// ==========================================

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function () {

            const result = reader.result;

            // Remove:
            // data:image/png;base64,
            // data:image/jpeg;base64,
            // etc.

            const base64 =
                result.split(",")[1];

            resolve(base64);

        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Unable to read selected file."
                )
            );

        };

        reader.readAsDataURL(file);

    });

}