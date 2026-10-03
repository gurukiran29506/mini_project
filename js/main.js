// ========================================
// INSTALLMENT SCHEDULE GENERATOR
// Main JavaScript File
// ========================================


// ----------------------------------------
// PAGE LOAD
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "Installment Schedule Generator loaded successfully."
    );

    checkLoginStatus();

    displayUserName();

});


// ----------------------------------------
// CHECK LOGIN STATUS
// ----------------------------------------

function checkLoginStatus() {

    const currentPage =
        window.location.pathname;

    const protectedPages = [
        "dashboard.html",
        "loan.html",
        "schedule.html",
        "report.html"
    ];

    const isProtectedPage =
        protectedPages.some(function (page) {

            return currentPage.includes(page);

        });


    const loggedIn =
        localStorage.getItem("loggedIn");


    if (isProtectedPage && loggedIn !== "true") {

        alert(
            "Please login to access this page."
        );

        window.location.href =
            "login.html";
    }
}


// ----------------------------------------
// DISPLAY USER NAME
// ----------------------------------------

function displayUserName() {

    const userNameElement =
        document.getElementById("userName");

    if (!userNameElement) {
        return;
    }


    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (user) {

        userNameElement.textContent =
            user.name;

    }

}


// ----------------------------------------
// LOGOUT
// ----------------------------------------

function logout() {

    localStorage.removeItem("loggedIn");

    window.location.href =
        "index.html";
}


// ----------------------------------------
// CLEAR LOAN DATA
// ----------------------------------------

function clearLoanData() {

    localStorage.removeItem("loanData");

}


// ----------------------------------------
// FORMAT CURRENCY
// ----------------------------------------

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(amount);

}


// ----------------------------------------
// FORMAT DATE
// ----------------------------------------

function formatDate(date) {

    const formattedDate =
        new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    return formattedDate;

}


// ----------------------------------------
// SHOW MESSAGE
// ----------------------------------------

function showMessage(
    message,
    type = "info"
) {

    alert(message);

}


// ----------------------------------------
// CONFIRM ACTION
// ----------------------------------------

function confirmAction(message) {

    return confirm(message);

}