// ==========================================
// INSTALLMENT SCHEDULE GENERATOR - LOAN FORM
// Handles loan input & calls Java backend
// ==========================================

const API_ROOT = window.API_BASE !== undefined ? window.API_BASE : "";

document.addEventListener("DOMContentLoaded", function () {
    const loanForm = document.getElementById("loanForm");
    const startDateInput = document.getElementById("startDate");

    // Set default starting date to today's date if empty
    if (startDateInput && !startDateInput.value) {
        const today = new Date().toISOString().split("T")[0];
        startDateInput.value = today;
    }

    if (loanForm) {
        loanForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const principal = parseFloat(document.getElementById("principal").value);
            const interest = parseFloat(document.getElementById("interest").value);
            const tenure = parseInt(document.getElementById("tenure").value, 10);
            const frequency = document.getElementById("frequency").value || "monthly";
            const startDate = document.getElementById("startDate").value;

            // Form validation
            if (isNaN(principal) || principal <= 0) {
                alert("Please enter a valid principal loan amount greater than zero.");
                return;
            }
            if (isNaN(interest) || interest < 0) {
                alert("Please enter a valid non-negative interest rate.");
                return;
            }
            if (isNaN(tenure) || tenure <= 0) {
                alert("Please enter a valid loan tenure in months.");
                return;
            }
            if (!startDate) {
                alert("Please select a loan starting date.");
                return;
            }

            const submitBtn = loanForm.querySelector("button[type='submit']");
            const origText = submitBtn ? submitBtn.innerText : "Generate Schedule";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Calculating & Generating Schedule...";
            }

            let currentUser = null;
            try {
                currentUser = JSON.parse(localStorage.getItem("user"));
            } catch (e) {}

            const requestPayload = {
                principal: principal,
                annualInterestRate: interest,
                tenureMonths: tenure,
                frequency: frequency,
                startDate: startDate,
                save: true,
                userId: currentUser && currentUser.userId ? currentUser.userId : null
            };

            try {
                const response = await fetch(`${API_ROOT}/api/loans/calculate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestPayload)
                });

                const json = await response.json();

                if (response.ok && json.success && json.data) {
                    const result = json.data;

                    // Save calculation result for schedule.html
                    localStorage.setItem("loanData", JSON.stringify(result));
                    if (result.loanId) {
                        localStorage.setItem("currentLoanId", result.loanId);
                    }

                    // Redirect to schedule page
                    window.location.href = "schedule.html" + (result.loanId ? `?loanId=${result.loanId}` : "");
                } else {
                    alert(json.message || "Failed to calculate installment schedule.");
                }
            } catch (error) {
                console.warn("Backend unavailable, calculating locally using SRS formula:", error);
                
                // Fallback client-side calculation using the SRS formula:
                // EMI = [P * R * (1 + R)^N] / [(1 + R)^N - 1]
                const monthlyRate = (interest / 12) / 100;
                let emi = 0;
                if (monthlyRate === 0) {
                    emi = principal / tenure;
                } else {
                    const factor = Math.pow(1 + monthlyRate, tenure);
                    emi = (principal * monthlyRate * factor) / (factor - 1);
                }

                const fallbackData = {
                    principal: principal,
                    annualRate: interest,
                    tenure: tenure,
                    frequency: frequency,
                    startDate: startDate,
                    emi: emi,
                    totalPayment: emi * tenure,
                    totalInterest: (emi * tenure) - principal
                };

                localStorage.setItem("loanData", JSON.stringify(fallbackData));
                window.location.href = "schedule.html";
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = origText;
                }
            }
        });
    }
});
