// ==========================================
// INSTALLMENT SCHEDULE GENERATOR - SCHEDULE VIEW
// Displays schedule and supports report export
// ==========================================

const API_ROOT = window.API_BASE !== undefined ? window.API_BASE : "";

document.addEventListener("DOMContentLoaded", async function () {
    const scheduleBody = document.getElementById("scheduleBody");
    const summary = document.getElementById("summary");

    if (!scheduleBody || !summary) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const loanId = urlParams.get("loanId") || localStorage.getItem("currentLoanId");

    let loanData = null;

    // 1. If loanId exists, fetch fresh record from backend
    if (loanId) {
        try {
            const res = await fetch(`${API_ROOT}/api/loans/${loanId}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    const l = json.data;
                    loanData = {
                        loanId: l.loanId,
                        principal: l.principalAmount,
                        annualRate: l.interestRate,
                        tenure: l.tenure,
                        frequency: l.frequency,
                        startDate: l.startDate,
                        emi: l.emi,
                        totalPayment: l.totalPayment,
                        totalInterest: l.totalInterest,
                        schedule: l.schedule
                    };
                }
            }
        } catch (e) {
            console.warn("Could not fetch loan from API, using localStorage data.", e);
        }
    }

    // 2. Fall back to localStorage if needed
    if (!loanData) {
        try {
            loanData = JSON.parse(localStorage.getItem("loanData"));
        } catch (e) {}
    }

    if (!loanData) {
        summary.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>No loan schedule found. Please generate a schedule first.</p>
                <a href="loan.html" class="btn" style="margin-top: 15px;">Generate New Schedule</a>
            </div>
        `;
        return;
    }

    // 3. Render Loan Summary Card
    const principalVal = loanData.principal || 0;
    const rateVal = loanData.annualRate !== undefined ? loanData.annualRate : 0;
    const tenureVal = loanData.tenure || 0;
    const emiVal = loanData.emi || 0;
    const frequencyVal = loanData.frequency || "Monthly";
    const totalPaymentVal = loanData.totalPayment || (emiVal * tenureVal);
    const totalInterestVal = loanData.totalInterest || (totalPaymentVal - principalVal);

    summary.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
            <h2 style="font-size: 20px; color: #1f2937;">Loan Summary & Breakdown</h2>
            <div style="display: flex; gap: 10px;">
                ${loanData.loanId ? `
                    <a href="${API_ROOT}/api/loans/${loanData.loanId}/export/csv" class="btn" style="background: #059669; padding: 8px 16px; font-size: 14px;" download>
                        ⬇ Download CSV
                    </a>
                    <a href="report.html?loanId=${loanData.loanId}" class="btn" style="background: #4f46e5; padding: 8px 16px; font-size: 14px;">
                        📄 Printable Report
                    </a>
                ` : `
                    <a href="report.html" class="btn" style="background: #4f46e5; padding: 8px 16px; font-size: 14px;">
                        📄 Printable Report
                    </a>
                `}
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 13px;">Principal Amount</div>
                <div style="font-size: 18px; font-weight: bold; color: #0f172a;">₹${principalVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 13px;">Interest Rate</div>
                <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${rateVal}% <span style="font-size: 12px; font-weight: normal; color: #64748b;">(p.a.)</span></div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 13px;">Tenure & Frequency</div>
                <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${tenureVal} mos <span style="font-size: 12px; font-weight: normal; color: #64748b;">(${frequencyVal})</span></div>
            </div>
            <div style="background: #eff6ff; padding: 12px; border-radius: 6px; border: 1px solid #bfdbfe;">
                <div style="color: #1e40af; font-size: 13px;">Periodic Installment (EMI)</div>
                <div style="font-size: 18px; font-weight: bold; color: #1d4ed8;">₹${emiVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 13px;">Total Interest</div>
                <div style="font-size: 18px; font-weight: bold; color: #dc2626;">₹${totalInterestVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: #64748b; font-size: 13px;">Total Payment</div>
                <div style="font-size: 18px; font-weight: bold; color: #0f172a;">₹${totalPaymentVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
        </div>
    `;

    // 4. Render Schedule Table Rows
    scheduleBody.innerHTML = "";

    // If backend provided precalculated schedule items
    if (loanData.schedule && loanData.schedule.length > 0) {
        let sumPrincipal = 0;
        let sumInterest = 0;
        let sumTotal = 0;

        loanData.schedule.forEach(item => {
            sumPrincipal += item.principalPaid;
            sumInterest += item.interestPaid;
            sumTotal += item.installmentAmount;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${item.installmentNo}</strong></td>
                <td>${item.dueDate}</td>
                <td>₹${item.installmentAmount.toFixed(2)}</td>
                <td>₹${item.principalPaid.toFixed(2)}</td>
                <td>₹${item.interestPaid.toFixed(2)}</td>
                <td>₹${item.balance.toFixed(2)}</td>
            `;
            scheduleBody.appendChild(row);
        });

        // Totals row
        const totalRow = document.createElement("tr");
        totalRow.style.background = "#e2e8f0";
        totalRow.style.fontWeight = "bold";
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right; padding-right: 15px;">TOTAL:</td>
            <td>₹${sumTotal.toFixed(2)}</td>
            <td>₹${sumPrincipal.toFixed(2)}</td>
            <td>₹${sumInterest.toFixed(2)}</td>
            <td>₹0.00</td>
        `;
        scheduleBody.appendChild(totalRow);

    } else {
        // Fallback generator loop using the SRS reducing balance formula
        let balance = principalVal;
        let totalInterest = 0;
        let totalPayment = 0;
        const monthlyRate = (rateVal / 12) / 100;
        const baseDate = loanData.startDate ? new Date(loanData.startDate) : new Date();

        for (let i = 1; i <= tenureVal; i++) {
            let interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
            let principalPaid = emiVal - interest;

            if (i === tenureVal || principalPaid > balance) {
                principalPaid = balance;
                interest = Math.max(0, emiVal - principalPaid);
            }

            balance = balance - principalPaid;
            if (balance < 0 || i === tenureVal) {
                balance = 0;
            }

            totalInterest += interest;
            totalPayment += (principalPaid + interest);

            const dueDate = new Date(baseDate);
            dueDate.setMonth(dueDate.getMonth() + i);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${i}</strong></td>
                <td>${dueDate.toLocaleDateString("en-IN")}</td>
                <td>₹${(principalPaid + interest).toFixed(2)}</td>
                <td>₹${principalPaid.toFixed(2)}</td>
                <td>₹${interest.toFixed(2)}</td>
                <td>₹${balance.toFixed(2)}</td>
            `;
            scheduleBody.appendChild(row);
        }

        const totalRow = document.createElement("tr");
        totalRow.style.background = "#e2e8f0";
        totalRow.style.fontWeight = "bold";
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right; padding-right: 15px;">TOTAL:</td>
            <td>₹${totalPayment.toFixed(2)}</td>
            <td>₹${principalVal.toFixed(2)}</td>
            <td>₹${totalInterest.toFixed(2)}</td>
            <td>₹0.00</td>
        `;
        scheduleBody.appendChild(totalRow);
    }
});