// REGISTER

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }

        const user = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        alert("Registration successful!");

        window.location.href = "login.html";
    });
}


// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const storedUser =
            JSON.parse(localStorage.getItem("user"));

        if (!storedUser) {

            alert("Please register first.");
            return;
        }

        if (
            email === storedUser.email &&
            password === storedUser.password
        ) {

            localStorage.setItem("loggedIn", "true");

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } else {

            alert("Invalid email or password.");
        }

    });
}