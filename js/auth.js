// ==========================================
// INSTALLMENT SCHEDULE GENERATOR - AUTH
// Connects frontend to Java Backend REST API
// ==========================================

const API_ROOT = window.API_BASE !== undefined ? window.API_BASE : "";

// ------------------------------------------
// DROPDOWN MESSAGE COMPONENT
// ------------------------------------------
function showDropdownMessage({ title, message, type = "success", redirectUrl = null, duration = 2200, actions = [] }) {
    let container = document.getElementById("dropdownMessageContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "dropdownMessageContainer";
        container.className = "dropdown-msg-container";
        document.body.prepend(container);
    }

    const icon = type === "success" ? "✓" : "✕";
    const actionsHtml = actions && actions.length > 0 
        ? `<div class="dropdown-msg-actions">
            ${actions.map(a => `<a href="${a.url}" class="dropdown-msg-btn ${a.primary ? 'primary' : 'secondary'}">${a.label}</a>`).join('')}
           </div>` 
        : '';

    container.innerHTML = `
        <div class="dropdown-msg-box ${type}">
            <div class="dropdown-msg-header">
                <div class="dropdown-msg-icon">${icon}</div>
                <div class="dropdown-msg-content">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
            ${actionsHtml}
            <div class="dropdown-progress-bar" style="animation: progressShrink ${duration}ms linear forwards;"></div>
        </div>
    `;

    // Trigger dropdown slide-down
    requestAnimationFrame(() => {
        container.classList.add("active");
    });

    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, duration);
    } else {
        setTimeout(() => {
            container.classList.remove("active");
        }, duration);
    }
}

window.showDropdownMessage = showDropdownMessage;


// ------------------------------------------
// REGISTER
// ------------------------------------------
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password) {
            showDropdownMessage({
                title: "Missing Information",
                message: "Please fill in all required fields to create your account.",
                type: "error",
                duration: 3000
            });
            return;
        }

        if (password !== confirmPassword) {
            showDropdownMessage({
                title: "Password Mismatch",
                message: "The entered passwords do not match. Please verify and try again.",
                type: "error",
                duration: 3000
            });
            return;
        }

        if (password.length < 6) {
            showDropdownMessage({
                title: "Weak Password",
                message: "Password must be at least 6 characters long.",
                type: "error",
                duration: 3000
            });
            return;
        }

        const submitBtn = registerForm.querySelector("button[type='submit']");
        const origBtnText = submitBtn ? submitBtn.innerText : "Register";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Registering...";
        }

        try {
            const response = await fetch(`${API_ROOT}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: "USER"
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showDropdownMessage({
                    title: "Registration Successful!",
                    message: "Account created successfully! Redirecting to login page...",
                    type: "success",
                    redirectUrl: "login.html",
                    duration: 2000
                });
            } else {
                showDropdownMessage({
                    title: "Registration Failed",
                    message: result.message || "Registration failed. Please try again.",
                    type: "error",
                    duration: 3500
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            // Fallback for offline testing
            const user = { name, email, password, role: "USER" };
            localStorage.setItem("user", JSON.stringify(user));
            showDropdownMessage({
                title: "Registered Successfully!",
                message: "Account saved locally (Offline mode). Redirecting to login...",
                type: "success",
                redirectUrl: "login.html",
                duration: 2000
            });
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = origBtnText;
            }
        }
    });
}


// ------------------------------------------
// LOGIN
// ------------------------------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showDropdownMessage({
                title: "Missing Information",
                message: "Please enter both your email address and password.",
                type: "error",
                duration: 3000
            });
            return;
        }

        const submitBtn = loginForm.querySelector("button[type='submit']");
        const origBtnText = submitBtn ? submitBtn.innerText : "Login";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Signing in...";
        }

        try {
            const response = await fetch(`${API_ROOT}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("user", JSON.stringify(result.data));
                
                showDropdownMessage({
                    title: "Login Successful!",
                    message: `Welcome back, <strong>${result.data.name || 'User'}</strong>! Connecting to Dashboard...`,
                    type: "success",
                    redirectUrl: "dashboard.html",
                    duration: 1800,
                    actions: [
                        { label: "📊 Go to Dashboard", url: "dashboard.html", primary: true },
                        { label: "🧮 Loan Calculator", url: "loan.html", primary: false }
                    ]
                });
                return;
            } else {
                showDropdownMessage({
                    title: "Login Failed",
                    message: result.message || "Invalid email or password. Please try again.",
                    type: "error",
                    duration: 3500
                });
            }
        } catch (error) {
            console.warn("Backend not reached, checking local/demo credentials:", error);
            
            // Robust fallback: Check stored user or default demo accounts
            const storedUser = JSON.parse(localStorage.getItem("user") || "null");
            let authenticatedUser = null;

            if (storedUser && storedUser.email && storedUser.email.toLowerCase() === email.toLowerCase() && storedUser.password === password) {
                authenticatedUser = storedUser;
            } else if (email.toLowerCase() === "admin@installment.com" && password === "admin123") {
                authenticatedUser = {
                    userId: 1,
                    name: "Administrator",
                    email: "admin@installment.com",
                    role: "ADMIN"
                };
            } else if (email.toLowerCase() === "demo@student.com" && password === "student123") {
                authenticatedUser = {
                    userId: 2,
                    name: "Demo Student",
                    email: "demo@student.com",
                    role: "USER"
                };
            }

            if (authenticatedUser) {
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("user", JSON.stringify(authenticatedUser));
                
                showDropdownMessage({
                    title: "Login Successful!",
                    message: `Welcome back, <strong>${authenticatedUser.name}</strong>! Connecting to Dashboard...`,
                    type: "success",
                    redirectUrl: "dashboard.html",
                    duration: 1800,
                    actions: [
                        { label: "📊 Go to Dashboard", url: "dashboard.html", primary: true },
                        { label: "🧮 Loan Calculator", url: "loan.html", primary: false }
                    ]
                });
            } else {
                showDropdownMessage({
                    title: "Invalid Credentials",
                    message: "Incorrect email or password. Try the quick demo buttons below.",
                    type: "error",
                    duration: 3500
                });
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = origBtnText;
            }
        }
    });
}