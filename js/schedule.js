const loanData =
    JSON.parse(
        localStorage.getItem("loanData")
    );

const scheduleBody =
    document.getElementById("scheduleBody");

const summary =
    document.getElementById("summary");


if (loanData && scheduleBody) {

    let balance = loanData.principal;

    let totalInterest = 0;

    let totalPayment = 0;

    const monthlyRate =
        loanData.annualRate / 12 / 100;


    // SUMMARY

    summary.innerHTML = `
        <p>
            <strong>Principal:</strong>
            ₹${loanData.principal.toFixed(2)}
        </p>

        <p>
            <strong>Interest Rate:</strong>
            ${loanData.annualRate}%
        </p>

        <p>
            <strong>Tenure:</strong>
            ${loanData.tenure} months
        </p>

        <p>
            <strong>Monthly EMI:</strong>
            ₹${loanData.emi.toFixed(2)}
        </p>
    `;


    // SCHEDULE

    for (
        let i = 1;
        i <= loanData.tenure;
        i++
    ) {

        let interest;

        let principalPaid;


        if (monthlyRate === 0) {

            interest = 0;

            principalPaid =
                loanData.emi;

        } else {

            interest =
                balance * monthlyRate;

            principalPaid =
                loanData.emi - interest;
        }


        // Avoid negative final balance

        if (principalPaid > balance) {

            principalPaid = balance;
        }


        balance =
            balance - principalPaid;


        if (balance < 0) {

            balance = 0;
        }


        totalInterest += interest;

        totalPayment +=
            principalPaid + interest;


        const date =
            new Date(loanData.startDate);

        date.setMonth(
            date.getMonth() + i
        );


        const dueDate =
            date.toLocaleDateString(
                "en-IN"
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${i}</td>

            <td>${dueDate}</td>

            <td>
                ₹${loanData.emi.toFixed(2)}
            </td>

            <td>
                ₹${principalPaid.toFixed(2)}
            </td>

            <td>
                ₹${interest.toFixed(2)}
            </td>

            <td>
                ₹${balance.toFixed(2)}
            </td>

        `;


        scheduleBody.appendChild(row);
    }


    // TOTALS

    const totalRow =
        document.createElement("tr");


    totalRow.innerHTML = `

        <th colspan="2">
            Total
        </th>

        <th>
            ₹${totalPayment.toFixed(2)}
        </th>

        <th>
            ₹${loanData.principal.toFixed(2)}
        </th>

        <th>
            ₹${totalInterest.toFixed(2)}
        </th>

        <th>
            ₹0.00
        </th>

    `;


    scheduleBody.appendChild(totalRow);
}