// ===================================
// Dashboard Protection
// ===================================

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    alert("Please login first!");
    window.location.href = "login.html";
}

// ===================================
// User Information
// ===================================

const userName = localStorage.getItem("userName") || "Sujju";

document.getElementById("username").textContent = userName;
document.getElementById("welcome-message").textContent =
    "👋 Hello, " + userName;
document.getElementById("profile-letter").textContent =
    userName.charAt(0).toUpperCase();

// ===================================
// Chat Storage
// ===================================

let chats = JSON.parse(localStorage.getItem("aiBrotherChats")) || {};

let currentChat = Object.keys(chats)[0] || "New Chat";

if (!chats[currentChat]) {
    chats[currentChat] = [];
}

// ===================================
// DOM Elements
// ===================================

const searchInput =
    document.querySelector(".search-box input");

const sendButton =
    document.getElementById("send-btn");

const userInput =
    document.getElementById("user-input");

const chatList =
    document.getElementById("chat-list");

const chatBox =
    document.getElementById("chat-box");

const newChatButton =
    document.querySelector(".new-chat");

// ===================================
// Time
// ===================================

function getTime() {

    return new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

// ===================================
// Save Chats
// ===================================

function saveChats(){

    localStorage.setItem(

        "aiBrotherChats",

        JSON.stringify(chats)

    );

}

// ===================================
// Typing Animation
// ===================================

function showTyping(){

    const typing = document.createElement("div");

    typing.className = "typing";

    typing.id = "typing";

    typing.innerHTML = `

        <span></span>

        <span></span>

        <span></span>

    `;

    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

}

function removeTyping(){

    const typing = document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

// ===================================
// Streaming Reply
// ===================================

async function typeReply(text){

    const messageDiv = document.createElement("div");

    messageDiv.className = "bot-message";

    messageDiv.innerHTML = `

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

    chatBox.appendChild(messageDiv);

    const content =
        messageDiv.querySelector(".message-content");

    for(let i=0;i<text.length;i++){

        content.textContent += text.charAt(i);

        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve=>setTimeout(resolve,18));

    }

    // Copy

    const copyBtn =
        messageDiv.querySelector(".copy-btn");

    copyBtn.addEventListener("click",()=>{

        navigator.clipboard.writeText(text);

        copyBtn.innerHTML="✅ Copied!";

        setTimeout(()=>{

            copyBtn.innerHTML="📋 Copy";

        },2000);

    });

    // Regenerate

    const regenBtn =
        messageDiv.querySelector(".regen-btn");

    regenBtn.addEventListener("click",()=>{

        alert("🚀 Regenerate feature coming in Part 4");

    });

    chats[currentChat].push({

        sender:"bot",

        message:text,

        time:getTime()

    });

    saveChats();

}
// ===================================
// Add Message
// ===================================

function addMessage(text, sender){

    const messageDiv = document.createElement("div");

    messageDiv.className =
        sender === "user"
        ? "user-message"
        : "bot-message";

    if(sender==="user"){

        messageDiv.innerHTML=`

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

    }

    else{

        messageDiv.innerHTML=`

            <div class="message-content">

                ${text}

            </div>

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

    }

    chatBox.appendChild(messageDiv);

    // ========================
    // COPY BUTTON
    // ========================

    const copyBtn =
        messageDiv.querySelector(".copy-btn");

    if(copyBtn){

        copyBtn.addEventListener("click",()=>{

            navigator.clipboard.writeText(text);

            copyBtn.innerHTML="✅ Copied!";

            setTimeout(()=>{

                copyBtn.innerHTML="📋 Copy";

            },2000);

        });

    }

    // ========================
    // REGENERATE BUTTON
    // ========================

    const regenBtn =
        messageDiv.querySelector(".regen-btn");

    if(regenBtn){

        regenBtn.addEventListener("click",()=>{

            alert("🚀 Regenerate feature coming soon!");

        });

    }

    // ========================
    // EDIT BUTTON
    // ========================

    const editBtn =
        messageDiv.querySelector(".edit-btn");

    if(editBtn){

        editBtn.addEventListener("click",()=>{

            userInput.value=text;

            messageDiv.remove();

        });

    }

    chats[currentChat].push({

        sender:sender,

        message:text,

        time:getTime()

    });

    saveChats();

    chatBox.scrollTop=chatBox.scrollHeight;

}
// ===================================
// Send Message
// ===================================

async function sendMessage(){

    const message = userInput.value.trim();

    if(message==="") return;

    if(!chats[currentChat]){

        chats[currentChat]=[];

    }

    // Show User Message

    addMessage(message,"user");
    if (
    currentChat.startsWith("New Chat") &&
    chats[currentChat].length === 1
) {

    let title = message;

    if (title.length > 25) {
        title = title.substring(0, 25) + "...";
    }

    chats[title] = chats[currentChat];

    delete chats[currentChat];

    currentChat = title;

    localStorage.setItem(
        "aiBrotherChats",
        JSON.stringify(chats)
    );

    renderChatList();
}

userInput.value = "";

showTyping();

    userInput.value="";

    userInput.focus();

    // Show Typing Animation

    showTyping();

    try{

        const response = await fetch(

            `https://ai-brother-backend.onrender.com/chat?message=${encodeURIComponent(message)}`

        );

        const data = await response.json();

        removeTyping();

        await typeReply(data.reply);

    }

    catch(error){

        removeTyping();

        addMessage(

            "❌ Backend is not running. Please start FastAPI.",

            "bot"

        );

    }

}

// ===================================
// Send Button
// ===================================

sendButton.addEventListener("click",()=>{

    sendMessage();

});

// ===================================
// Press Enter
// ===================================

userInput.addEventListener("keypress",(event)=>{

    if(event.key==="Enter"){

        sendMessage();

    }

});
// ===================================
// New Chat
// ===================================

newChatButton.addEventListener("click", () => {

    const count = Object.keys(chats).length + 1;

    currentChat = `New Chat ${count}`;

    chats[currentChat] = [];

    saveChats();

    renderChatList();

    loadChatHistory();

});

// ===================================
// Load Chat History
// ===================================

function loadChatHistory(){

    chatBox.innerHTML = "";

    if(!chats[currentChat] || chats[currentChat].length===0){

        chatBox.innerHTML = `

        <div class="welcome">

            <h1 id="welcome-message">

                👋 Hello, ${userName}

            </h1>

            <p>

                I'm AI Brother.<br>

                Ask me anything.

            </p>

        </div>

        `;

        return;

    }

    chats[currentChat].forEach(chat=>{

        addMessage(chat.message,chat.sender);

    });

}

// ===================================
// Render Chat List
// ===================================

function renderChatList(){

    chatList.innerHTML="";

    Object.keys(chats).forEach(chatName=>{

        const item=document.createElement("div");

        item.className="history-item";

        if(chatName===currentChat){

            item.classList.add("active-chat");

        }

        item.innerHTML=`

            <span class="chat-title">

                💬 ${chatName}

            </span>

            <span class="chat-delete">

                🗑

            </span>

        `;

        // Switch Chat

        item.querySelector(".chat-title")
        .addEventListener("click",()=>{

            currentChat=chatName;

            renderChatList();

            loadChatHistory();

        });

        // Rename

        item.querySelector(".chat-title")
        .addEventListener("dblclick",()=>{

            const newName=prompt(

                "Rename Chat",

                chatName

            );

            if(!newName) return;

            if(chats[newName]){

                alert("Chat already exists!");

                return;

            }

            chats[newName]=chats[chatName];

            delete chats[chatName];

            currentChat=newName;

            saveChats();

            renderChatList();

        });

        // Delete

        item.querySelector(".chat-delete")
        .addEventListener("click",(e)=>{

            e.stopPropagation();

            if(!confirm("Delete this chat?")) return;

            delete chats[chatName];

            if(Object.keys(chats).length===0){

                chats["New Chat"]=[];

            }

            currentChat=Object.keys(chats)[0];

            saveChats();

            renderChatList();

            loadChatHistory();

        });

        chatList.appendChild(item);

    });

}

// ===================================
// Search Chats
// ===================================

searchInput.addEventListener("input",()=>{

    const keyword=searchInput.value.toLowerCase();

    document
    .querySelectorAll(".history-item")
    .forEach(item=>{

        if(item.innerText.toLowerCase().includes(keyword))

            item.style.display="flex";

        else

            item.style.display="none";

    });

});

// ===================================
// Initial Load
// ===================================

renderChatList();

loadChatHistory();