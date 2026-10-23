// ==========================================
// INSTALLMENT SCHEDULE GENERATOR - REPORT VIEW
// Formal Repayment Statement & Report (SRS FR11)
// ==========================================

const API_ROOT = window.API_BASE !== undefined ? window.API_BASE : "";

document.addEventListener("DOMContentLoaded", async function () {
    const reportDetails = document.getElementById("reportDetails");
    if (!reportDetails) return;

    const urlParams = new URLSearchParams(window.location.search);
    const loanId = urlParams.get("loanId") || localStorage.getItem("currentLoanId");

    let loanData = null;

    if (loanId) {
        try {
            const res = await fetch(`${API_ROOT}/api/loans/${loanId}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    loanData = json.data;
                }
            }
        } catch (e) {
            console.warn("Could not fetch loan from API, using localStorage:", e);
        }
    }

    if (!loanData) {
        try {
            loanData = JSON.parse(localStorage.getItem("loanData"));
        } catch (e) {}
    }

    if (!loanData) {
        reportDetails.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>No report information available. Please generate or select a loan schedule first.</p>
                <a href="dashboard.html" class="btn" style="margin-top: 15px;">Go to Dashboard</a>
            </div>
        `;
        return;
    }

    const principal = loanData.principalAmount || loanData.principal || 0;
    const rate = loanData.interestRate !== undefined ? loanData.interestRate : (loanData.annualRate || 0);
    const tenure = loanData.tenure || 0;
    const frequency = loanData.frequency || "Monthly";
    const startDate = loanData.startDate || "N/A";
    const emi = loanData.emi || 0;
    const totalPayment = loanData.totalPayment || (emi * tenure);
    const totalInterest = loanData.totalInterest || (totalPayment - principal);
    const borrowerName = loanData.userName || (JSON.parse(localStorage.getItem("user") || "{}").name) || "Valued Borrower";
    const reportDate = new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });

    let scheduleRowsHtml = "";
    if (loanData.schedule && loanData.schedule.length > 0) {
        loanData.schedule.forEach(item => {
            scheduleRowsHtml += `
                <tr>
                    <td>${item.installmentNo}</td>
                    <td>${item.dueDate}</td>
                    <td>₹${item.installmentAmount.toFixed(2)}</td>
                    <td>₹${item.principalPaid.toFixed(2)}</td>
                    <td>₹${item.interestPaid.toFixed(2)}</td>
                    <td>₹${item.balance.toFixed(2)}</td>
                    <td><span style="color: #059669; font-weight: 500;">${item.status || 'Scheduled'}</span></td>
                </tr>
            `;
        });
    }

    reportDetails.innerHTML = `
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
            <div>
                <h2 style="font-size: 24px; color: #0f172a; margin-bottom: 5px;">REPAYMENT STATEMENT & SCHEDULE</h2>
                <div style="color: #64748b; font-size: 13px;">BCA Final Year Minor Project • Installment Schedule Generator</div>
                <div style="color: #64748b; font-size: 13px;">Formula: Reducing-Balance Periodic Installment (SRS Section 12)</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: bold; color: #1e293b;">Loan Ref: ISG-${loanData.loanId || 'DEMO-1'}</div>
                <div style="color: #64748b; font-size: 13px;">Statement Date: ${reportDate}</div>
                <div style="color: #059669; font-weight: bold; font-size: 13px; margin-top: 4px;">Status: ACTIVE / VERIFIED</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 14px; text-transform: uppercase; color: #475569; margin-bottom: 10px;">Borrower Information</h4>
                <div style="font-size: 14px; line-height: 1.8;">
                    <strong>Name:</strong> ${borrowerName}<br>
                    <strong>Facility Type:</strong> Term Loan<br>
                    <strong>Repayment Mode:</strong> Reducing Balance Equated Periodic Installment
                </div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 14px; text-transform: uppercase; color: #475569; margin-bottom: 10px;">Facility Parameters</h4>
                <div style="font-size: 14px; line-height: 1.8;">
                    <strong>Principal Amount:</strong> ₹${principal.toLocaleString('en-IN', {minimumFractionDigits: 2})}<br>
                    <strong>Annual Interest Rate:</strong> ${rate}% p.a.<br>
                    <strong>Tenure & Frequency:</strong> ${tenure} months (${frequency})<br>
                    <strong>First Disbursement / Start Date:</strong> ${startDate}
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; border: 1px solid #bfdbfe; text-align: center;">
                <div style="color: #1e40af; font-size: 12px; font-weight: bold; text-transform: uppercase;">Periodic Installment (EMI)</div>
                <div style="font-size: 22px; font-weight: bold; color: #1d4ed8; margin-top: 5px;">₹${emi.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </div>
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca; text-align: center;">
                <div style="color: #991b1b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Total Interest Payable</div>
                <div style="font-size: 22px; font-weight: bold; color: #dc2626; margin-top: 5px;">₹${totalInterest.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px solid #bbf7d0; text-align: center;">
                <div style="color: #166534; font-size: 12px; font-weight: bold; text-transform: uppercase;">Total Repayment Outflow</div>
                <div style="font-size: 22px; font-weight: bold; color: #15803d; margin-top: 5px;">₹${totalPayment.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </div>
        </div>

        <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 12px;">Detailed Amortization Repayment Schedule</h3>
        <div class="table-container" style="margin-bottom: 30px;">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Due Date</th>
                        <th>Installment</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRowsHtml}
                </tbody>
                <tfoot>
                    <tr style="background: #e2e8f0; font-weight: bold;">
                        <td colspan="2" style="text-align: right;">TOTAL:</td>
                        <td>₹${totalPayment.toFixed(2)}</td>
                        <td>₹${principal.toFixed(2)}</td>
                        <td>₹${totalInterest.toFixed(2)}</td>
                        <td>₹0.00</td>
                        <td>COMPLETED</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div style="margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="font-size: 12px; color: #64748b; max-width: 480px; line-height: 1.5;">
                <strong>Disclaimer:</strong> This installment schedule is generated using standard reducing-balance actuarial computation according to the BCA Project SRS specification.
            </div>
            <div style="text-align: center;">
                <div style="font-family: cursive; font-size: 18px; color: #1e293b; margin-bottom: 5px;">Authorized Officer</div>
                <div style="border-top: 1px solid #94a3b8; width: 160px; font-size: 11px; color: #64748b; padding-top: 3px;">Installment Schedule System</div>
            </div>
        </div>
    `;
});
