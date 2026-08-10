const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all fields.");
        return;
    }

    const button = document.querySelector(".login-btn");

    const originalText = button.innerHTML;

    button.innerHTML = "Logging in...";

    button.disabled = true;

    try {

        const response = await fetch("http://https://ai-brother-backend.onrender.com/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,

                password: password

            })

        });

        const data = await response.json();

        if (response.ok) {

            alert("Welcome " + data.name + "!");

            localStorage.setItem("isLoggedIn", "true");

localStorage.setItem(
    "user",
    JSON.stringify({
        name: data.name,
        email: data.email
    })
);

localStorage.setItem("userName", data.name);
localStorage.setItem("userEmail", data.email);

window.location.href = "index.html";

        } else {

            alert(data.detail);

        }

    } catch (error) {

        alert("Cannot connect to backend.");

    }

    button.innerHTML = originalText;

    button.disabled = false;

});