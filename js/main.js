// ========================================
// INSTALLMENT SCHEDULE GENERATOR
// Main JavaScript File
// ========================================

const API_ROOT = window.API_BASE !== undefined ? window.API_BASE : "";

// ----------------------------------------
// PAGE LOAD
// ----------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    console.log("Installment Schedule Generator loaded successfully.");

    checkLoginStatus();
    displayUserName();
    setupDashboardIfPresent();
});


// ----------------------------------------
// CHECK LOGIN STATUS (BYPASS - DIRECT ACCESS)
// ----------------------------------------
function checkLoginStatus() {
    // Login requirement removed: direct access enabled across all pages
    if (!localStorage.getItem("loggedIn")) {
        localStorage.setItem("loggedIn", "true");
    }
    if (!localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify({
            userId: 1,
            name: "Borrower",
            email: "borrower@installment.com",
            role: "USER"
        }));
    }
}


// ----------------------------------------
// DISPLAY USER NAME & ROLE BADGE
// ----------------------------------------
function displayUserName() {
    const userNameElement = document.getElementById("userName");
    const userRoleElement = document.getElementById("userRole");

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {}

    if (userNameElement && user) {
        userNameElement.textContent = user.name || user.email;
    }

    if (userRoleElement && user) {
        userRoleElement.textContent = user.role || "USER";
        if (user.role === "ADMIN") {
            userRoleElement.style.background = "#f59e0b";
            userRoleElement.style.color = "#fff";
            userRoleElement.style.padding = "2px 8px";
            userRoleElement.style.borderRadius = "12px";
            userRoleElement.style.fontSize = "12px";
        }
    }
}


// ----------------------------------------
// LOGOUT
// ----------------------------------------
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("loanData");
    localStorage.removeItem("currentLoanId");
    window.location.href = "index.html";
}


// ----------------------------------------
// DASHBOARD LOANS LOADER
// ----------------------------------------
async function setupDashboardIfPresent() {
    const loansTableBody = document.getElementById("savedLoansBody");
    const adminPanel = document.getElementById("adminPanel");
    const statsContainer = document.getElementById("dashboardStats");

    if (!loansTableBody && !adminPanel && !statsContainer) {
        return;
    }

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {}

    if (!user) return;

    // Load Loans for user or admin
    try {
        const url = user.role === "ADMIN" 
            ? `${API_ROOT}/api/loans` 
            : `${API_ROOT}/api/loans?userId=${user.userId}`;

        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
                renderSavedLoans(json.data, user);
                renderStats(json.data);
            }
        }
    } catch (e) {
        console.warn("Could not load loans list:", e);
    }

    // If Admin, load users management panel (SRS FR12)
    if (user.role === "ADMIN" && adminPanel) {
        adminPanel.style.display = "block";
        loadAdminUsersTable();
    }
}

function renderSavedLoans(loans, user) {
    const loansTableBody = document.getElementById("savedLoansBody");
    if (!loansTableBody) return;

    if (!loans || loans.length === 0) {
        loansTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #64748b; padding: 25px;">
                    No saved loan records yet. Click <strong>"Create Schedule"</strong> above to generate your first loan repayment schedule.
                </td>
            </tr>
        `;
        return;
    }

    loansTableBody.innerHTML = "";
    loans.forEach(loan => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${loan.loanId}</td>
            ${user.role === "ADMIN" ? `<td><strong>${loan.userName || 'User #' + loan.userId}</strong></td>` : ''}
            <td>₹${loan.principalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            <td>${loan.interestRate}%</td>
            <td>${loan.tenure} mos (${loan.frequency})</td>
            <td><strong>₹${loan.emi.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></td>
            <td>${loan.startDate}</td>
            <td>
                <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                    <a href="schedule.html?loanId=${loan.loanId}" class="action-btn view-btn" title="View Full Schedule">View</a>
                    <a href="report.html?loanId=${loan.loanId}" class="action-btn report-btn" title="Printable Report">Report</a>
                    <a href="${API_ROOT}/api/loans/${loan.loanId}/export/csv" class="action-btn csv-btn" title="Download CSV">CSV</a>
                    <button onclick="deleteLoanRecord(${loan.loanId})" class="action-btn delete-btn" title="Delete Record">Del</button>
                </div>
            </td>
        `;
        loansTableBody.appendChild(tr);
    });
}

function renderStats(loans) {
    const statsContainer = document.getElementById("dashboardStats");
    if (!statsContainer) return;

    let totalPrincipal = 0;
    let totalInterest = 0;
    loans.forEach(l => {
        totalPrincipal += (l.principalAmount || 0);
        totalInterest += (l.totalInterest || 0);
    });

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Loan Records</div>
            <div class="stat-value">${loans.length}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Principal Handled</div>
            <div class="stat-value">₹${totalPrincipal.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Expected Interest</div>
            <div class="stat-value">₹${totalInterest.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
        </div>
    `;
}

async function loadAdminUsersTable() {
    const tbody = document.getElementById("adminUsersBody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_ROOT}/api/admin/users`);
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
                tbody.innerHTML = "";
                json.data.forEach(u => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>#${u.userId}</td>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td><span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}">${u.role}</span></td>
                        <td>${u.createdAt || '-'}</td>
                        <td>
                            ${u.role !== 'ADMIN' ? `<button onclick="deleteUserRecord(${u.userId})" class="action-btn delete-btn">Delete</button>` : '<span style="color:#94a3b8; font-size:12px;">Protected</span>'}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch (e) {
        console.warn("Could not load admin users:", e);
    }
}

async function deleteLoanRecord(loanId) {
    if (!confirm(`Are you sure you want to delete loan record #${loanId}? This will remove all its schedule records.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_ROOT}/api/loans/${loanId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
            alert("Loan deleted successfully.");
            location.reload();
        } else {
            alert(json.message || "Could not delete loan.");
        }
    } catch (e) {
        alert("Failed to delete loan: " + e.toString());
    }
}

async function deleteUserRecord(userId) {
    if (!confirm(`Are you sure you want to delete user #${userId}? All their associated loans will be deleted.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_ROOT}/api/admin/users/${userId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
            alert("User deleted successfully.");
            loadAdminUsersTable();
            location.reload();
        } else {
            alert(json.message || "Could not delete user.");
        }
    } catch (e) {
        alert("Failed to delete user: " + e.toString());
    }
}

window.logout = logout;
window.deleteLoanRecord = deleteLoanRecord;
window.deleteUserRecord = deleteUserRecord;