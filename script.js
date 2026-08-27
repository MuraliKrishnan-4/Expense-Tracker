// ========================================
// EXPENSE TRACKER
// SUPABASE DATABASE + EXPENSE CHART
// ========================================



// ========================================
// GET ELEMENTS
// ========================================

const transactionForm =
    document.getElementById("transactionForm");


const descriptionInput =
    document.getElementById("description");


const amountInput =
    document.getElementById("amount");


const categoryInput =
    document.getElementById("category");


const customCategoryBox =
    document.getElementById("customCategoryBox");


const customCategoryInput =
    document.getElementById("customCategory");


const typeInput =
    document.getElementById("type");


const transactionDateInput =
    document.getElementById("transactionDate");


const transactionList =
    document.getElementById("transactionList");


const loading =
    document.getElementById("loading");


const emptyMessage =
    document.getElementById("emptyMessage");


const refreshBtn =
    document.getElementById("refreshBtn");


const logoutBtn =
    document.getElementById("logoutBtn");


const profileBtn =
    document.getElementById("profileBtn");


const profileMenu =
    document.getElementById("profileMenu");


const profileName =
    document.getElementById("profileName");


const profileEmail =
    document.getElementById("profileEmail");


const balanceElement =
    document.getElementById("balance");


const totalIncomeElement =
    document.getElementById("totalIncome");


const totalExpenseElement =
    document.getElementById("totalExpense");


const addTransactionBtn =
    document.getElementById("addTransactionBtn");


const expenseChartCanvas =
    document.getElementById("expenseChart");


const chartLegend =
    document.getElementById("chartLegend");


const chartCenter =
    document.getElementById("chartCenter");


const chartTotal =
    document.getElementById("chartTotal");


const chartEmpty =
    document.getElementById("chartEmpty");



// ========================================
// GLOBAL VARIABLES
// ========================================

let transactions = [];

let expenseChart = null;



// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setTodayDate();

        setupProfile();

        setupCategory();

        await checkUser();

    }
);



// ========================================
// SET TODAY DATE
// ========================================

function setTodayDate() {

    if (!transactionDateInput) {

        return;

    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    transactionDateInput.value =
        year +
        "-" +
        month +
        "-" +
        day;

}



// ========================================
// CHECK USER
// ========================================

async function checkUser() {

    const session =
        getSession();


    if (
        !session ||
        !session.access_token ||
        !session.user
    ) {

        window.location.href =
            "auth.html";

        return;

    }


    displayUserProfile(
        session.user
    );


    await loadTransactions();

}



// ========================================
// DISPLAY USER PROFILE
// ========================================

function displayUserProfile(
    user
) {

    if (!user) {

        return;

    }


    const email =
        user.email || "No email";


    const metadata =
        user.user_metadata || {};


    const name =
        metadata.full_name ||
        metadata.name ||
        email.split("@")[0] ||
        "User";


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            email;

    }

}



// ========================================
// PROFILE MENU
// ========================================

function setupProfile() {

    if (
        !profileBtn ||
        !profileMenu
    ) {

        return;

    }


    profileBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            profileMenu.classList.toggle(
                "show"
            );

        }
    );


    profileMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        function () {

            profileMenu.classList.remove(
                "show"
            );

        }
    );

}



// ========================================
// CATEGORY SETUP
// ========================================

function setupCategory() {

    if (!categoryInput) {

        return;

    }


    categoryInput.addEventListener(
        "change",
        function () {

            if (
                categoryInput.value ===
                "Other"
            ) {

                customCategoryBox.classList.remove(
                    "hidden"
                );


                customCategoryInput.required =
                    true;


                setTimeout(
                    function () {

                        customCategoryInput.focus();

                    },
                    50
                );

            }

            else {

                customCategoryBox.classList.add(
                    "hidden"
                );


                customCategoryInput.required =
                    false;


                customCategoryInput.value =
                    "";

            }

        }
    );

}



// ========================================
// GET FINAL CATEGORY
// ========================================

function getFinalCategory() {

    const selectedCategory =
        categoryInput.value;


    if (
        selectedCategory ===
        "Other"
    ) {

        const customCategory =
            customCategoryInput.value.trim();


        if (!customCategory) {

            alert(
                "Please enter a category."
            );

            customCategoryInput.focus();

            return null;

        }


        return customCategory;

    }


    return selectedCategory;

}



// ========================================
// ADD TRANSACTION
// ========================================

if (transactionForm) {

    transactionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const session =
                getSession();


            if (
                !session ||
                !session.access_token ||
                !session.user
            ) {

                alert(
                    "Your session has expired. Please login again."
                );


                window.location.href =
                    "auth.html";


                return;

            }


            const description =
                descriptionInput.value.trim();


            const amount =
                Number(
                    amountInput.value
                );


            const finalCategory =
                getFinalCategory();


            const type =
                typeInput.value;


            const transactionDate =
                transactionDateInput.value;


            if (!description) {

                alert(
                    "Please enter a description."
                );

                descriptionInput.focus();

                return;

            }


            if (
                !amount ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                amountInput.focus();

                return;

            }


            if (!finalCategory) {

                alert(
                    "Please select a category."
                );

                categoryInput.focus();

                return;

            }


            if (!type) {

                alert(
                    "Please select transaction type."
                );

                typeInput.focus();

                return;

            }


            if (!transactionDate) {

                alert(
                    "Please select a date."
                );

                transactionDateInput.focus();

                return;

            }


            addTransactionBtn.disabled =
                true;


            addTransactionBtn.textContent =
                "Adding...";


            try {

                const response =
                    await fetch(
                        SUPABASE_URL +
                        "/rest/v1/transactions",
                        {

                            method: "POST",

                            headers: {
                                ...getDatabaseHeaders(),

                                "Prefer":
                                    "return=representation"

                            },

                            body:
                                JSON.stringify({

                                    user_id:
                                        session.user.id,

                                    description:
                                        description,

                                    amount:
                                        amount,

                                    category:
                                        finalCategory,

                                    type:
                                        type,

                                    transaction_date:
                                        transactionDate

                                })

                        }
                    );


                const text =
                    await response.text();


                let data =
                    null;


                if (text) {

                    try {

                        data =
                            JSON.parse(text);

                    }

                    catch (parseError) {

                        data =
                            null;

                    }

                }


                if (!response.ok) {

                    const errorMessage =
                        data &&
                        (
                            data.message ||
                            data.error_description ||
                            data.hint ||
                            data.details
                        )
                            ? (
                                data.message ||
                                data.error_description ||
                                data.hint ||
                                data.details
                            )
                            : "Unable to add transaction.";


                    throw new Error(
                        errorMessage
                    );

                }


                transactionForm.reset();


                setTodayDate();


                customCategoryBox.classList.add(
                    "hidden"
                );


                customCategoryInput.required =
                    false;


                customCategoryInput.value =
                    "";


                categoryInput.value =
                    "";


                typeInput.value =
                    "expense";


                alert(
                    "Transaction added successfully."
                );


                await loadTransactions();

            }

            catch (error) {

                console.error(
                    "Add transaction error:",
                    error
                );


                alert(
                    "Failed to add transaction: " +
                    error.message
                );

            }

            finally {

                addTransactionBtn.disabled =
                    false;


                addTransactionBtn.textContent =
                    "Add Transaction";

            }

        }
    );

}



// ========================================
// LOAD TRANSACTIONS
// ========================================

async function loadTransactions() {

    if (loading) {

        loading.style.display =
            "block";

    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    try {

        const session =
            getSession();


        if (
            !session ||
            !session.access_token ||
            !session.user
        ) {

            window.location.href =
                "auth.html";

            return;

        }


        const userId =
            session.user.id;


        const url =
            SUPABASE_URL +
            "/rest/v1/transactions" +
            "?select=*" +
            "&user_id=eq." +
            encodeURIComponent(userId) +
            "&order=transaction_date.desc,created_at.desc";


        const response =
            await fetch(
                url,
                {

                    method: "GET",

                    headers:
                        getDatabaseHeaders()

                }
            );


        const text =
            await response.text();


        let data =
            [];


        if (text) {

            try {

                data =
                    JSON.parse(text);

            }

            catch (parseError) {

                throw new Error(
                    "Invalid response from database."
                );

            }

        }


        if (!response.ok) {

            const errorMessage =
                data &&
                (
                    data.message ||
                    data.error_description ||
                    data.hint ||
                    data.details
                )
                    ? (
                        data.message ||
                        data.error_description ||
                        data.hint ||
                        data.details
                    )
                    : "Unable to load transactions.";


            throw new Error(
                errorMessage
            );

        }


        transactions =
            Array.isArray(data)
                ? data
                : [];


        displayTransactions();

        updateSummary();

        updateExpenseChart();

    }

    catch (error) {

        console.error(
            "Load transactions error:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        alert(
            "Failed to load transactions: " +
            error.message
        );

    }

}



// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

    if (!transactionList) {

        return;

    }


    transactionList.innerHTML =
        "";


    if (loading) {

        loading.style.display =
            "none";

    }


    if (
        !transactions ||
        transactions.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }


        return;

    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    transactions.forEach(
        function (transaction) {

            const row =
                document.createElement(
                    "tr"
                );


            const descriptionCell =
                document.createElement(
                    "td"
                );


            descriptionCell.textContent =
                transaction.description ||
                "";


            const categoryCell =
                document.createElement(
                    "td"
                );


            categoryCell.textContent =
                transaction.category ||
                "";


            const typeCell =
                document.createElement(
                    "td"
                );


            typeCell.textContent =
                transaction.type ===
                "income"
                    ? "Income"
                    : "Expense";


            typeCell.className =
                transaction.type ===
                "income"
                    ? "income"
                    : "expense";


            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                formatDate(
                    transaction.transaction_date
                );


            const amountCell =
                document.createElement(
                    "td"
                );


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            amountCell.textContent =
                (
                    transaction.type ===
                    "income"
                        ? "+ ₹"
                        : "- ₹"
                ) +
                amount.toFixed(2);


            amountCell.className =
                transaction.type ===
                "income"
                    ? "income"
                    : "expense";


            const actionCell =
                document.createElement(
                    "td"
                );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "delete-btn";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteTransaction(
                        transaction.id
                    );

                }
            );


            actionCell.appendChild(
                deleteButton
            );


            row.appendChild(
                descriptionCell
            );


            row.appendChild(
                categoryCell
            );


            row.appendChild(
                typeCell
            );


            row.appendChild(
                dateCell
            );


            row.appendChild(
                amountCell
            );


            row.appendChild(
                actionCell
            );


            transactionList.appendChild(
                row
            );

        }
    );

}



// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    let totalIncome =
        0;


    let totalExpense =
        0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    amount;

            }

            else {

                totalExpense +=
                    amount;

            }

        }
    );


    const balance =
        totalIncome -
        totalExpense;


    if (totalIncomeElement) {

        totalIncomeElement.textContent =
            formatCurrency(
                totalIncome
            );

    }


    if (totalExpenseElement) {

        totalExpenseElement.textContent =
            formatCurrency(
                totalExpense
            );

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatCurrency(
                balance
            );

    }

}



// ========================================
// EXPENSE CHART
// ========================================

function updateExpenseChart() {

    if (!expenseChartCanvas) {

        return;

    }


    const categoryTotals =
        {};


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const category =
                transaction.category ||
                "Other";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (amount <= 0) {

                return;

            }


            if (
                !categoryTotals[category]
            ) {

                categoryTotals[category] =
                    0;

            }


            categoryTotals[category] +=
                amount;

        }
    );


    const categories =
        Object.keys(
            categoryTotals
        );


    const values =
        categories.map(
            function (category) {

                return categoryTotals[
                    category
                ];

            }
        );


    const totalExpense =
        values.reduce(
            function (
                total,
                amount
            ) {

                return total + amount;

            },
            0
        );


    updateChartTotal(
        totalExpense
    );


    if (
        categories.length ===
        0 ||
        totalExpense <= 0
    ) {

        if (chartEmpty) {

            chartEmpty.style.display =
                "block";

        }


        if (chartLegend) {

            chartLegend.innerHTML =
                "";

        }


        if (expenseChart) {

            expenseChart.destroy();

            expenseChart =
                null;

        }


        if (chartCenter) {

            chartCenter.innerHTML =
                `
                    <strong>₹0.00</strong>
                    <span>Total Expense</span>
                `;

        }


        return;

    }


    if (chartEmpty) {

        chartEmpty.style.display =
            "none";

    }


    const chartColors =
        generateChartColors(
            categories.length
        );


    if (expenseChart) {

        expenseChart.destroy();

        expenseChart =
            null;

    }


    expenseChart =
        new Chart(
            expenseChartCanvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        categories,

                    datasets: [

                        {

                            data:
                                values,

                            backgroundColor:
                                chartColors,

                            borderColor:
                                "#ffffff",

                            borderWidth:
                                3,

                            hoverOffset:
                                8

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "68%",

                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw
                                            ) || 0;


                                        const percentage =
                                            totalExpense >
                                            0
                                                ? (
                                                    value /
                                                    totalExpense
                                                ) *
                                                100
                                                : 0;


                                        return (
                                            " " +
                                            context.label +
                                            ": ₹" +
                                            value.toFixed(
                                                2
                                            ) +
                                            " (" +
                                            percentage.toFixed(
                                                1
                                            ) +
                                            "%)"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );


    updateChartCenter(
        totalExpense
    );


    updateChartLegend(
        categories,
        values,
        chartColors,
        totalExpense
    );

}



// ========================================
// UPDATE CHART TOTAL
// ========================================

function updateChartTotal(
    totalExpense
) {

    if (chartTotal) {

        chartTotal.textContent =
            formatCurrency(
                totalExpense
            );

    }

}



// ========================================
// UPDATE CHART CENTER
// ========================================

function updateChartCenter(
    totalExpense
) {

    if (!chartCenter) {

        return;

    }


    chartCenter.innerHTML =
        `
            <strong>
                ${formatCurrency(totalExpense)}
            </strong>

            <span>
                Total Expense
            </span>
        `;

}



// ========================================
// UPDATE CHART LEGEND
// ========================================

function updateChartLegend(
    categories,
    values,
    chartColors,
    totalExpense
) {

    if (!chartLegend) {

        return;

    }


    chartLegend.innerHTML =
        "";


    categories.forEach(
        function (
            category,
            index
        ) {

            const value =
                values[index];


            const percentage =
                totalExpense >
                0
                    ? (
                        value /
                        totalExpense
                    ) *
                    100
                    : 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "chart-legend-item";


            const left =
                document.createElement(
                    "div"
                );


            left.className =
                "chart-legend-left";


            const dot =
                document.createElement(
                    "span"
                );


            dot.className =
                "chart-legend-dot";


            dot.style.backgroundColor =
                chartColors[index];


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "chart-legend-name";


            name.textContent =
                category;


            left.appendChild(
                dot
            );


            left.appendChild(
                name
            );


            const right =
                document.createElement(
                    "span"
                );


            right.className =
                "chart-legend-value";


            right.textContent =
                "₹" +
                value.toFixed(
                    2
                ) +
                " (" +
                percentage.toFixed(
                    1
                ) +
                "%)";


            item.appendChild(
                left
            );


            item.appendChild(
                right
            );


            chartLegend.appendChild(
                item
            );

        }
    );

}



// ========================================
// GENERATE CHART COLORS
// ========================================

function generateChartColors(
    count
) {

    const colors = [];


    const predefinedColors = [

        "#16a085",

        "#3498db",

        "#9b59b6",

        "#f39c12",

        "#e74c3c",

        "#1abc9c",

        "#34495e",

        "#e67e22",

        "#2ecc71",

        "#8e44ad",

        "#2980b9",

        "#d35400"

    ];


    for (
        let index = 0;
        index < count;
        index++
    ) {

        colors.push(
            predefinedColors[
                index %
                predefinedColors.length
            ]
        );

    }


    return colors;

}



// ========================================
// DELETE TRANSACTION
// ========================================

async function deleteTransaction(
    transactionId
) {

    if (!transactionId) {

        alert(
            "Transaction ID is missing."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const session =
            getSession();


        if (
            !session ||
            !session.access_token
        ) {

            window.location.href =
                "auth.html";

            return;

        }


        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/transactions" +
                "?id=eq." +
                encodeURIComponent(
                    transactionId
                ),
                {

                    method: "DELETE",

                    headers:
                        getDatabaseHeaders()

                }
            );


        const text =
            await response.text();


        let data =
            null;


        if (text) {

            try {

                data =
                    JSON.parse(text);

            }

            catch (error) {

                data =
                    null;

            }

        }


        if (!response.ok) {

            const errorMessage =
                data &&
                (
                    data.message ||
                    data.error ||
                    data.hint ||
                    data.details
                )
                    ? (
                        data.message ||
                        data.error ||
                        data.hint ||
                        data.details
                    )
                    : "Unable to delete transaction.";


            throw new Error(
                errorMessage
            );

        }


        await loadTransactions();

    }

    catch (error) {

        console.error(
            "Delete transaction error:",
            error
        );


        alert(
            "Failed to delete transaction: " +
            error.message
        );

    }

}



// ========================================
// REFRESH
// ========================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled =
                true;


            refreshBtn.textContent =
                "Refreshing...";


            try {

                await loadTransactions();

            }

            finally {

                refreshBtn.disabled =
                    false;


                refreshBtn.textContent =
                    "Refresh";

            }

        }
    );

}



// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            removeSession();


            window.location.href =
                "auth.html";

        }
    );

}



// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(
    amount
) {

    const number =
        Number(amount) || 0;


    return (
        "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,

                maximumFractionDigits: 2
            }
        )
    );

}



// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            dateValue +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}