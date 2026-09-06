document.addEventListener("DOMContentLoaded", async () => {

    // =========================================================
    // SUPABASE
    // =========================================================

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not found.");
        return;
    }

    // =========================================================
    // SESSION CHECK
    // =========================================================

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("auth.html");
        return;
    }

    const user = session.user;

    // =========================================================
    // PROFILE
    // =========================================================

    const profileBtn =
        document.getElementById("profileBtn");

    const profileMenu =
        document.getElementById("profileMenu");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileDetailName =
        document.getElementById("profileDetailName");

    const profileDetailEmail =
        document.getElementById("profileDetailEmail");

    const userName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

    const userEmail =
        user.email || "";

    if (profileName) {
        profileName.textContent = userName;
    }

    if (profileEmail) {
        profileEmail.textContent = userEmail;
    }

    if (profileDetailName) {
        profileDetailName.textContent = userName;
    }

    if (profileDetailEmail) {
        profileDetailEmail.textContent = userEmail;
    }

    // =========================================================
    // PROFILE MENU
    // =========================================================

    if (profileBtn && profileMenu) {

        profileBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                profileMenu.classList.toggle("show");

            }
        );

        document.addEventListener(
            "click",
            event => {

                if (
                    !profileMenu.contains(event.target) &&
                    !profileBtn.contains(event.target)
                ) {

                    profileMenu.classList.remove("show");

                }

            }
        );

    }

    // =========================================================
    // LOGOUT
    // =========================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                logoutBtn.disabled = true;
                logoutBtn.textContent = "Logging out...";

                const { error } =
                    await supabase.auth.signOut();

                if (error) {

                    console.error(error);

                    alert(
                        "Logout failed. Please try again."
                    );

                    logoutBtn.disabled = false;
                    logoutBtn.textContent = "Logout";

                    return;
                }

                window.location.replace("auth.html");

            }
        );

    }

    // =========================================================
    // ADD TRANSACTION ELEMENTS
    // =========================================================

    const transactionForm =
        document.getElementById("transactionForm");

    const description =
        document.getElementById("description");

    const amount =
        document.getElementById("amount");

    const category =
        document.getElementById("category");

    const type =
        document.getElementById("type");

    const date =
        document.getElementById("date");

    const addTransactionBtn =
        document.getElementById("addTransactionBtn");

    const transactionMessage =
        document.getElementById("transactionMessage");

    // =========================================================
    // TABLE ELEMENTS
    // =========================================================

    const transactionsBody =
        document.getElementById("transactionsBody");

    const loadingTransactions =
        document.getElementById("loadingTransactions");

    const refreshBtn =
        document.getElementById("refreshBtn");

    const transactionSearch =
        document.getElementById("transactionSearch");

    // =========================================================
    // SUMMARY ELEMENTS
    // =========================================================

    const balanceEl =
        document.getElementById("balance");

    const incomeEl =
        document.getElementById("income");

    const expenseEl =
        document.getElementById("expense");

    const savingMessage =
        document.getElementById("savingMessage");

    // =========================================================
    // GLOBAL DATA
    // =========================================================

    let allTransactions = [];

    let selectedMonth = getCurrentMonth();

    let expenseChart = null;

    // =========================================================
    // MONTH SELECTOR
    // =========================================================

    let monthSelector =
        document.getElementById(
            "dashboardMonthSelector"
        );

    function createMonthSelector() {

        if (monthSelector) {
            return;
        }

        const summaryGrid =
            document.querySelector(".summary-grid");

        if (!summaryGrid) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.id =
            "dashboardMonthSelectorWrapper";

        wrapper.innerHTML = `

            <div class="dashboard-month-control">

                <label for="dashboardMonthSelector">
                    Selected Month
                </label>

                <select id="dashboardMonthSelector"></select>

            </div>

        `;

        const style =
            document.createElement("style");

        style.id =
            "selectedMonthStyles";

        style.textContent = `

            #dashboardMonthSelectorWrapper {
                width: 100%;
                margin-bottom: 15px;
            }

            .dashboard-month-control {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 12px;
            }

            .dashboard-month-control label {
                color: #17375e;
                font-size: 14px;
                font-weight: 500;
            }

            #dashboardMonthSelector {
                min-width: 190px;
                height: 42px;
                padding: 0 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                background: #ffffff;
                color: #17375e;
                font-size: 14px;
                cursor: pointer;
            }

            #dashboardMonthSelector:focus {
                outline: none;
                border-color: #2f4b73;
            }

            .selected-month-title {
                color: #64748b;
                font-size: 14px;
                margin: 0 0 12px 0;
            }

            .chart-card {
                overflow: hidden;
            }

            .chart-layout {
                width: 100%;
                min-width: 0;
                display: grid;
                grid-template-columns:
                    minmax(0, 1fr)
                    minmax(180px, 280px);
                gap: 25px;
                align-items: center;
            }

            .chart-container {
                position: relative;
                width: 100%;
                min-width: 0;
                height: 350px;
            }

            .chart-container canvas {
                max-width: 100%;
            }

            .chart-legend {
                width: 100%;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 13px;
            }

            .chart-legend-item {
                width: 100%;
                min-width: 0;
                display: flex;
                align-items: flex-start;
                gap: 9px;
                color: #0f2d55;
                font-size: 14px;
                line-height: 1.4;
            }

            .chart-legend-dot {
                width: 11px;
                height: 11px;
                min-width: 11px;
                margin-top: 4px;
                border-radius: 3px;
                display: inline-block;
            }

            @media (max-width: 700px) {

                #dashboardMonthSelectorWrapper {
                    margin-bottom: 15px;
                }

                .dashboard-month-control {
                    width: 100%;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: flex-start;
                    gap: 7px;
                }

                #dashboardMonthSelector {
                    width: 100%;
                    min-width: 0;
                }

                .chart-card {
                    width: 100%;
                    overflow: hidden;
                }

                .chart-layout {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    align-items: stretch;
                }

                .chart-container {
                    width: 100%;
                    height: 270px;
                    min-height: 270px;
                    max-height: 270px;
                }

                .chart-container canvas {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                }

                .chart-legend {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 11px;
                    padding: 0 5px 5px;
                    box-sizing: border-box;
                }

                .chart-legend-item {
                    width: 100%;
                    max-width: 100%;
                    font-size: 14px;
                    line-height: 1.4;
                    overflow-wrap: anywhere;
                }

                .chart-legend-dot {
                    flex-shrink: 0;
                }

            }

        `;

        document.head.appendChild(style);

        summaryGrid.parentElement.insertBefore(
            wrapper,
            summaryGrid
        );

        monthSelector =
            document.getElementById(
                "dashboardMonthSelector"
            );

        monthSelector.addEventListener(
            "change",
            () => {

                selectedMonth =
                    monthSelector.value;

                updateSelectedMonth();

            }
        );

    }

    // =========================================================
    // AVAILABLE MONTHS
    // =========================================================

    function getAvailableMonths() {

        const months = new Set();

        allTransactions.forEach(
            transaction => {

                if (!transaction.date) {
                    return;
                }

                months.add(
                    String(transaction.date).substring(
                        0,
                        7
                    )
                );

            }
        );

        months.add(getCurrentMonth());

        return Array.from(months)
            .sort()
            .reverse();

    }

    // =========================================================
    // UPDATE MONTH SELECTOR
    // =========================================================

    function updateMonthSelector() {

        createMonthSelector();

        if (!monthSelector) {
            return;
        }

        const months =
            getAvailableMonths();

        if (!months.includes(selectedMonth)) {

            selectedMonth =
                months[0] ||
                getCurrentMonth();

        }

        monthSelector.innerHTML = "";

        months.forEach(
            monthKey => {

                const option =
                    document.createElement("option");

                option.value =
                    monthKey;

                option.textContent =
                    formatMonthName(monthKey);

                monthSelector.appendChild(option);

            }
        );

        monthSelector.value =
            selectedMonth;

    }

    // =========================================================
    // SELECTED MONTH TRANSACTIONS
    // =========================================================

    function getSelectedMonthTransactions() {

        return allTransactions.filter(
            transaction => {

                if (!transaction.date) {
                    return false;
                }

                return String(
                    transaction.date
                ).substring(
                    0,
                    7
                ) === selectedMonth;

            }
        );

    }

    // =========================================================
    // UPDATE SELECTED MONTH
    // =========================================================

    function updateSelectedMonth() {

        updateMonthSelector();

        const monthTransactions =
            getSelectedMonthTransactions();

        updateSummary(
            monthTransactions
        );

        updateChart(
            monthTransactions
        );

        displayTransactions(
            monthTransactions
        );

        updateMonthTitle();

    }

    // =========================================================
    // MONTH TITLE
    // =========================================================

    function updateMonthTitle() {

        let title =
            document.getElementById(
                "selectedMonthTitle"
            );

        if (!title) {

            const summaryGrid =
                document.querySelector(
                    ".summary-grid"
                );

            if (!summaryGrid) {
                return;
            }

            title =
                document.createElement("div");

            title.id =
                "selectedMonthTitle";

            title.className =
                "selected-month-title";

            summaryGrid.parentElement.insertBefore(
                title,
                summaryGrid
            );

        }

        title.textContent =
            `${formatMonthName(
                selectedMonth
            )} — Monthly Summary`;

    }

    // =========================================================
    // ADD TRANSACTION
    // =========================================================

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                clearTransactionMessage();

                const descriptionValue =
                    description
                        ? description.value.trim()
                        : "";

                const amountValue =
                    amount
                        ? Number(amount.value)
                        : 0;

                const categoryValue =
                    category
                        ? category.value
                        : "";

                const typeValue =
                    type
                        ? type.value
                        : "expense";

                const dateValue =
                    date
                        ? date.value
                        : "";

                if (
                    !descriptionValue ||
                    !amountValue ||
                    amountValue <= 0 ||
                    !categoryValue ||
                    !dateValue
                ) {

                    showTransactionMessage(
                        "Please fill all fields with valid values.",
                        "error"
                    );

                    return;

                }

                addTransactionBtn.disabled =
                    true;

                addTransactionBtn.textContent =
                    "Adding...";

                try {

                    const { error } =
                        await supabase
                            .from("transactions")
                            .insert({

                                user_id:
                                    user.id,

                                description:
                                    descriptionValue,

                                amount:
                                    amountValue,

                                category:
                                    categoryValue,

                                type:
                                    typeValue,

                                date:
                                    dateValue

                            });

                    if (error) {
                        throw error;
                    }

                    showTransactionMessage(
                        "Transaction added successfully.",
                        "success"
                    );

                    selectedMonth =
                        dateValue.substring(
                            0,
                            7
                        );

                    transactionForm.reset();

                    if (date) {
                        date.value =
                            today();
                    }

                    if (type) {
                        type.value =
                            "expense";
                    }

                    await loadTransactions();

                } catch (error) {

                    console.error(
                        "Add transaction error:",
                        error
                    );

                    showTransactionMessage(
                        error.message ||
                        "Could not add transaction.",
                        "error"
                    );

                } finally {

                    addTransactionBtn.disabled =
                        false;

                    addTransactionBtn.textContent =
                        "Add Transaction";

                }

            }
        );

    }

    // =========================================================
    // LOAD TRANSACTIONS
    // =========================================================

    async function loadTransactions() {

        if (loadingTransactions) {

            loadingTransactions.style.display =
                "block";

            loadingTransactions.textContent =
                "Loading transactions...";

        }

        try {

            const {
                data,
                error
            } =
                await supabase
                    .from("transactions")
                    .select("*")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "date",
                        {
                            ascending: false
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) {
                throw error;
            }

            allTransactions =
                data || [];

            updateMonthSelector();

            updateSelectedMonth();

            if (loadingTransactions) {

                loadingTransactions.style.display =
                    "none";

            }

        } catch (error) {

            console.error(
                "Load transactions error:",
                error
            );

            if (loadingTransactions) {

                loadingTransactions.style.display =
                    "block";

                loadingTransactions.textContent =
                    "Could not load transactions.";

            }

        }

    }

    // =========================================================
    // SUMMARY
    // =========================================================

    function updateSummary(items) {

        let totalIncome =
            0;

        let totalExpense =
            0;

        items.forEach(
            transaction => {

                const value =
                    Number(
                        transaction.amount
                    ) || 0;

                const transactionType =
                    String(
                        transaction.type || ""
                    ).toLowerCase();

                if (
                    transactionType === "income"
                ) {

                    totalIncome += value;

                } else {

                    totalExpense += value;

                }

            }
        );

        const currentBalance =
            totalIncome -
            totalExpense;

        if (balanceEl) {

            balanceEl.textContent =
                currency(currentBalance);

        }

        if (incomeEl) {

            incomeEl.textContent =
                currency(totalIncome);

        }

        if (expenseEl) {

            expenseEl.textContent =
                currency(totalExpense);

        }

        if (savingMessage) {

            if (currentBalance > 0) {

                savingMessage.textContent =
                    `You are saving money in ${formatMonthName(
                        selectedMonth
                    )}.`;

            } else if (currentBalance < 0) {

                savingMessage.textContent =
                    `Your expenses are higher than your income in ${formatMonthName(
                        selectedMonth
                    )}.`;

            } else {

                savingMessage.textContent =
                    `Your balance is zero in ${formatMonthName(
                        selectedMonth
                    )}.`;

            }

        }

    }

    // =========================================================
    // CHART CATEGORY
    // =========================================================
    //
    // IMPORTANT:
    //
    // This function is ONLY for the chart.
    //
    // If database category = Other,
    // chart uses description.
    //
    // It does NOT modify the transaction itself.
    // =========================================================

    function getChartCategory(transaction) {

        const categoryValue =
            String(
                transaction.category || ""
            ).trim();

        const descriptionValue =
            String(
                transaction.description || ""
            ).trim();

        if (
            categoryValue.toLowerCase() ===
            "other"
        ) {

            if (descriptionValue) {

                return descriptionValue;

            }

        }

        return (
            categoryValue ||
            "Other"
        );

    }

    // =========================================================
    // TABLE CATEGORY
    // =========================================================
    //
    // IMPORTANT:
    //
    // The transaction table ALWAYS displays
    // the real database category.
    //
    // Therefore:
    //
    // category = Other
    //
    // remains:
    //
    // Other
    //
    // It will NOT be replaced by description.
    // =========================================================

    function getTransactionCategory(transaction) {

        return (
            transaction.category ||
            "Other"
        );

    }

    // =========================================================
    // EXPENSE CHART
    // =========================================================

    function updateChart(items) {

        const canvas =
            document.getElementById(
                "expenseChart"
            );

        const chartEmpty =
            document.getElementById(
                "chartEmpty"
            );

        const chartLegend =
            document.getElementById(
                "chartLegend"
            );

        if (!canvas) {
            return;
        }

        if (
            typeof Chart === "undefined"
        ) {

            console.error(
                "Chart.js is not loaded."
            );

            return;

        }

        if (expenseChart) {

            expenseChart.destroy();

            expenseChart =
                null;

        }

        if (chartLegend) {

            chartLegend.innerHTML =
                "";

        }

        const categoryTotals = {};

        // ONLY selected month is passed here.
        items.forEach(
            transaction => {

                const transactionType =
                    String(
                        transaction.type || ""
                    ).toLowerCase();

                if (
                    transactionType !== "expense"
                ) {

                    return;

                }

                const value =
                    Number(
                        transaction.amount
                    ) || 0;

                if (value <= 0) {
                    return;
                }

                // IMPORTANT:
                // Chart uses description for Other.
                const categoryName =
                    getChartCategory(
                        transaction
                    );

                categoryTotals[
                    categoryName
                ] =
                    (
                        categoryTotals[
                            categoryName
                        ] || 0
                    ) + value;

            }
        );

        const labels =
            Object.keys(
                categoryTotals
            );

        const values =
            Object.values(
                categoryTotals
            );

        if (!labels.length) {

            canvas.style.display =
                "none";

            if (chartEmpty) {

                chartEmpty.style.display =
                    "flex";

                chartEmpty.textContent =
                    `No expenses in ${formatMonthName(
                        selectedMonth
                    )}.`;

            }

            return;

        }

        canvas.style.display =
            "block";

        if (chartEmpty) {

            chartEmpty.style.display =
                "none";

        }

        // =====================================================
        // CHART COLORS
        // =====================================================

        const colors = [

            "#4F46E5",
            "#16A085",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#06B6D4",
            "#EC4899",
            "#84CC16",
            "#F97316",
            "#64748B"

        ];

        const totalExpense =
            values.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    Number(value),
                0
            );

        // =====================================================
        // CREATE CHART
        // =====================================================

        expenseChart =
            new Chart(
                canvas,
                {

                    type:
                        "doughnut",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                data:
                                    values,

                                backgroundColor:
                                    labels.map(
                                        (
                                            _,
                                            index
                                        ) =>
                                            colors[
                                                index %
                                                colors.length
                                            ]
                                    ),

                                borderColor:
                                    "#ffffff",

                                borderWidth:
                                    3,

                                hoverOffset:
                                    7

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "58%",

                        layout: {

                            padding:
                                5

                        },

                        plugins: {

                            // Disable Chart.js built-in
                            // legend because we use custom
                            // legend on the right/bottom.
                            legend: {

                                display:
                                    false

                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        context => {

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
                                                `${context.label}: ` +
                                                currency(
                                                    value
                                                ) +
                                                ` (${percentage.toFixed(
                                                    1
                                                )}%)`
                                            );

                                        }

                                }

                            }

                        }

                    }

                }
            );

        // =====================================================
        // CUSTOM LEGEND
        // =====================================================

        if (chartLegend) {

            labels.forEach(
                (
                    label,
                    index
                ) => {

                    const value =
                        Number(
                            values[index]
                        ) || 0;

                    const percentage =
                        totalExpense > 0
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

                    const dot =
                        document.createElement(
                            "span"
                        );

                    dot.className =
                        "chart-legend-dot";

                    dot.style.backgroundColor =
                        colors[
                            index %
                            colors.length
                        ];

                    const text =
                        document.createElement(
                            "span"
                        );

                    text.textContent =
                        `${label} • ${currency(
                            value
                        )} (${percentage.toFixed(
                            1
                        )}%)`;

                    item.appendChild(dot);

                    item.appendChild(text);

                    chartLegend.appendChild(item);

                }
            );

        }

    }

    // =========================================================
    // DISPLAY TRANSACTIONS
    // =========================================================

    function displayTransactions(items) {

        if (!transactionsBody) {
            return;
        }

        transactionsBody.innerHTML =
            "";

        if (
            !items ||
            !items.length
        ) {

            transactionsBody.innerHTML = `

                <tr>

                    <td colspan="6" class="empty">
                        No transactions found for ${formatMonthName(
                            selectedMonth
                        )}.
                    </td>

                </tr>

            `;

            return;

        }

        items.forEach(
            transaction => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const isIncome =
                    String(
                        transaction.type || ""
                    ).toLowerCase() ===
                    "income";

                const value =
                    Number(
                        transaction.amount
                    ) || 0;

                // =================================================
                // IMPORTANT:
                // TABLE SHOWS DATABASE CATEGORY ONLY.
                //
                // If category = Other,
                // table shows "Other".
                //
                // It does NOT use getChartCategory().
                // =================================================

                const displayCategory =
                    getTransactionCategory(
                        transaction
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            transaction.description
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            displayCategory
                        )}
                    </td>

                    <td>

                        <span
                            class="badge ${
                                isIncome
                                    ? "income"
                                    : "expense"
                            }"
                        >

                            ${
                                isIncome
                                    ? "Income"
                                    : "Expense"
                            }

                        </span>

                    </td>

                    <td>
                        ${formatDate(
                            transaction.date
                        )}
                    </td>

                    <td
                        class="${
                            isIncome
                                ? "income-text"
                                : "expense-text"
                        }"
                    >

                        ${
                            isIncome
                                ? "+"
                                : "-"
                        }${currency(
                            value
                        )}

                    </td>

                    <td>

                        <div class="transaction-actions">

                            <button
                                type="button"
                                class="edit-btn"
                                data-id="${transaction.id}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="delete-btn"
                                data-id="${transaction.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                `;

                transactionsBody.appendChild(
                    row
                );

            }
        );

        // =====================================================
        // EDIT BUTTONS
        // =====================================================

        transactionsBody
            .querySelectorAll(".edit-btn")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            openEditModal(
                                button.dataset.id
                            );

                        }
                    );

                }
            );

        // =====================================================
        // DELETE BUTTONS
        // =====================================================

        transactionsBody
            .querySelectorAll(".delete-btn")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteTransaction(
                                button.dataset.id
                            );

                        }
                    );

                }
            );

    }

    // =========================================================
    // SEARCH
    // =========================================================

    if (transactionSearch) {

        transactionSearch.addEventListener(
            "input",
            () => {

                const searchText =
                    transactionSearch.value
                        .trim()
                        .toLowerCase();

                const monthTransactions =
                    getSelectedMonthTransactions();

                if (!searchText) {

                    displayTransactions(
                        monthTransactions
                    );

                    return;

                }

                const filtered =
                    monthTransactions.filter(
                        transaction => {

                            const descriptionText =
                                String(
                                    transaction.description ||
                                    ""
                                ).toLowerCase();

                            // Search uses actual database category.
                            const categoryText =
                                String(
                                    transaction.category ||
                                    ""
                                ).toLowerCase();

                            const typeText =
                                String(
                                    transaction.type ||
                                    ""
                                ).toLowerCase();

                            const dateText =
                                String(
                                    transaction.date ||
                                    ""
                                ).toLowerCase();

                            const amountText =
                                String(
                                    transaction.amount ||
                                    ""
                                ).toLowerCase();

                            return (

                                descriptionText.includes(
                                    searchText
                                )

                                ||

                                categoryText.includes(
                                    searchText
                                )

                                ||

                                typeText.includes(
                                    searchText
                                )

                                ||

                                dateText.includes(
                                    searchText
                                )

                                ||

                                amountText.includes(
                                    searchText
                                )

                            );

                        }
                    );

                displayTransactions(
                    filtered
                );

            }
        );

    }

    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    async function deleteTransaction(id) {

        if (
            !confirm(
                "Delete this transaction?"
            )
        ) {

            return;

        }

        try {

            const { error } =
                await supabase
                    .from("transactions")
                    .delete()
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );

            if (error) {
                throw error;
            }

            await loadTransactions();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                error.message ||
                "Could not delete transaction."
            );

        }

    }

    // =========================================================
    // EDIT MODAL
    // =========================================================

    const editModal =
        document.getElementById(
            "editModal"
        );

    const editTransactionForm =
        document.getElementById(
            "editTransactionForm"
        );

    const editTransactionId =
        document.getElementById(
            "editTransactionId"
        );

    const editDescription =
        document.getElementById(
            "editDescription"
        );

    const editAmount =
        document.getElementById(
            "editAmount"
        );

    const editCategory =
        document.getElementById(
            "editCategory"
        );

    const editType =
        document.getElementById(
            "editType"
        );

    const editDate =
        document.getElementById(
            "editDate"
        );

    const editTransactionMessage =
        document.getElementById(
            "editTransactionMessage"
        );

    const closeEditModalBtn =
        document.getElementById(
            "closeEditModal"
        );

    const cancelEditBtn =
        document.getElementById(
            "cancelEditBtn"
        );

    const saveEditBtn =
        document.getElementById(
            "saveEditBtn"
        );

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    function openEditModal(id) {

        const transaction =
            allTransactions.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!transaction) {

            console.error(
                "Transaction not found:",
                id
            );

            return;

        }

        if (editTransactionId) {

            editTransactionId.value =
                transaction.id;

        }

        if (editDescription) {

            editDescription.value =
                transaction.description ||
                "";

        }

        if (editAmount) {

            editAmount.value =
                transaction.amount ||
                "";

        }

        if (editCategory) {

            editCategory.value =
                transaction.category ||
                "";

        }

        if (editType) {

            editType.value =
                String(
                    transaction.type ||
                    "expense"
                ).toLowerCase();

        }

        if (editDate) {

            editDate.value =
                transaction.date ||
                "";

        }

        if (editTransactionMessage) {

            editTransactionMessage.textContent =
                "";

            editTransactionMessage.className =
                "message";

        }

        if (editModal) {

            editModal.classList.remove(
                "hidden"
            );

            editModal.classList.add(
                "show"
            );

        }

    }

    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    function closeEditModal() {

        if (editModal) {

            editModal.classList.remove(
                "show"
            );

            editModal.classList.add(
                "hidden"
            );

        }

        if (editTransactionMessage) {

            editTransactionMessage.textContent =
                "";

            editTransactionMessage.className =
                "message";

        }

    }

    if (closeEditModalBtn) {

        closeEditModalBtn.addEventListener(
            "click",
            closeEditModal
        );

    }

    if (cancelEditBtn) {

        cancelEditBtn.addEventListener(
            "click",
            closeEditModal
        );

    }

    if (editModal) {

        editModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    editModal
                ) {

                    closeEditModal();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                if (
                    editModal &&
                    !editModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeEditModal();

                }

            }

        }
    );

    // =========================================================
    // SAVE EDIT
    // =========================================================

    if (editTransactionForm) {

        editTransactionForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const id =
                    editTransactionId
                        ? editTransactionId.value
                        : "";

                const descriptionValue =
                    editDescription
                        ? editDescription.value.trim()
                        : "";

                const amountValue =
                    editAmount
                        ? Number(
                            editAmount.value
                        )
                        : 0;

                const categoryValue =
                    editCategory
                        ? editCategory.value
                        : "";

                const typeValue =
                    editType
                        ? editType.value
                        : "expense";

                const dateValue =
                    editDate
                        ? editDate.value
                        : "";

                if (!id) {

                    showEditMessage(
                        "Transaction ID not found.",
                        "error"
                    );

                    return;

                }

                if (!descriptionValue) {

                    showEditMessage(
                        "Please enter a description.",
                        "error"
                    );

                    return;

                }

                if (
                    !amountValue ||
                    amountValue <= 0
                ) {

                    showEditMessage(
                        "Please enter a valid amount.",
                        "error"
                    );

                    return;

                }

                if (!categoryValue) {

                    showEditMessage(
                        "Please select a category.",
                        "error"
                    );

                    return;

                }

                if (!dateValue) {

                    showEditMessage(
                        "Please select a date.",
                        "error"
                    );

                    return;

                }

                if (saveEditBtn) {

                    saveEditBtn.disabled =
                        true;

                    saveEditBtn.textContent =
                        "Saving...";

                }

                try {

                    const { error } =
                        await supabase
                            .from("transactions")
                            .update({

                                description:
                                    descriptionValue,

                                amount:
                                    amountValue,

                                category:
                                    categoryValue,

                                type:
                                    typeValue,

                                date:
                                    dateValue

                            })
                            .eq(
                                "id",
                                id
                            )
                            .eq(
                                "user_id",
                                user.id
                            );

                    if (error) {
                        throw error;
                    }

                    showEditMessage(
                        "Transaction updated successfully.",
                        "success"
                    );

                    selectedMonth =
                        dateValue.substring(
                            0,
                            7
                        );

                    await loadTransactions();

                    setTimeout(
                        () => {

                            closeEditModal();

                        },
                        500
                    );

                } catch (error) {

                    console.error(
                        "Update transaction error:",
                        error
                    );

                    showEditMessage(
                        error.message ||
                        "Could not update transaction.",
                        "error"
                    );

                } finally {

                    if (saveEditBtn) {

                        saveEditBtn.disabled =
                            false;

                        saveEditBtn.textContent =
                            "Save Changes";

                    }

                }

            }
        );

    }

    // =========================================================
    // EDIT MESSAGE
    // =========================================================

    function showEditMessage(
        text,
        messageType
    ) {

        if (!editTransactionMessage) {
            return;
        }

        editTransactionMessage.textContent =
            text;

        editTransactionMessage.className =
            `message ${messageType}`;

    }

    // =========================================================
    // STATEMENTS
    // =========================================================

    const statementType =
        document.getElementById(
            "statementType"
        );

    const statementMonth =
        document.getElementById(
            "statementMonth"
        );

    const statementMonthGroup =
        document.getElementById(
            "statementMonthGroup"
        );

    const generateStatementBtn =
        document.getElementById(
            "generateStatementBtn"
        );

    const downloadStatementBtn =
        document.getElementById(
            "downloadStatementBtn"
        );

    const statementMessage =
        document.getElementById(
            "statementMessage"
        );

    const statementResult =
        document.getElementById(
            "statementResult"
        );

    const statementTitle =
        document.getElementById(
            "statementTitle"
        );

    const statementIncome =
        document.getElementById(
            "statementIncome"
        );

    const statementExpense =
        document.getElementById(
            "statementExpense"
        );

    const statementBalance =
        document.getElementById(
            "statementBalance"
        );

    const statementBody =
        document.getElementById(
            "statementBody"
        );

    let currentStatementTransactions =
        [];

    let currentStatementTitle =
        "";

    if (statementMonth) {

        statementMonth.value =
            getCurrentMonth();

    }

    if (statementType) {

        statementType.addEventListener(
            "change",
            () => {

                if (
                    statementType.value ===
                    "monthly"
                ) {

                    if (statementMonthGroup) {

                        statementMonthGroup.style.display =
                            "block";

                    }

                } else {

                    if (statementMonthGroup) {

                        statementMonthGroup.style.display =
                            "none";

                    }

                }

            }
        );

    }

    // =========================================================
    // GENERATE STATEMENT
    // =========================================================

    if (generateStatementBtn) {

        generateStatementBtn.addEventListener(
            "click",
            generateStatement
        );

    }

    async function generateStatement() {

        if (statementResult) {

            statementResult.classList.add(
                "hidden"
            );

        }

        if (downloadStatementBtn) {

            downloadStatementBtn.classList.add(
                "hidden"
            );

        }

        if (statementMessage) {

            statementMessage.textContent =
                "";

            statementMessage.className =
                "message";

        }

        generateStatementBtn.disabled =
            true;

        generateStatementBtn.textContent =
            "Generating...";

        try {

            let startDate;
            let endDate;
            let title;

            if (
                statementType &&
                statementType.value ===
                "monthly"
            ) {

                if (
                    !statementMonth ||
                    !statementMonth.value
                ) {

                    throw new Error(
                        "Please select a month."
                    );

                }

                const parts =
                    statementMonth.value.split("-");

                const year =
                    Number(parts[0]);

                const month =
                    Number(parts[1]);

                startDate =
                    `${year}-${String(
                        month
                    ).padStart(
                        2,
                        "0"
                    )}-01`;

                const lastDay =
                    new Date(
                        year,
                        month,
                        0
                    ).getDate();

                endDate =
                    `${year}-${String(
                        month
                    ).padStart(
                        2,
                        "0"
                    )}-${String(
                        lastDay
                    ).padStart(
                        2,
                        "0"
                    )}`;

                title =
                    `${formatMonthName(
                        statementMonth.value
                    )} Statement`;

            } else {

                const range =
                    getCurrentWeekRange();

                startDate =
                    range.start;

                endDate =
                    range.end;

                title =
                    `Weekly Statement (${formatDate(
                        startDate
                    )} to ${formatDate(
                        endDate
                    )})`;

            }

            const {
                data,
                error
            } =
                await supabase
                    .from("transactions")
                    .select("*")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .gte(
                        "date",
                        startDate
                    )
                    .lte(
                        "date",
                        endDate
                    )
                    .order(
                        "date",
                        {
                            ascending: false
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) {
                throw error;
            }

            currentStatementTransactions =
                data || [];

            currentStatementTitle =
                title;

            let statementIncomeValue =
                0;

            let statementExpenseValue =
                0;

            currentStatementTransactions.forEach(
                transaction => {

                    const value =
                        Number(
                            transaction.amount
                        ) || 0;

                    if (
                        String(
                            transaction.type || ""
                        ).toLowerCase() ===
                        "income"
                    ) {

                        statementIncomeValue +=
                            value;

                    } else {

                        statementExpenseValue +=
                            value;

                    }

                }
            );

            const statementBalanceValue =
                statementIncomeValue -
                statementExpenseValue;

            if (statementTitle) {

                statementTitle.textContent =
                    title;

            }

            if (statementIncome) {

                statementIncome.textContent =
                    currency(
                        statementIncomeValue
                    );

            }

            if (statementExpense) {

                statementExpense.textContent =
                    currency(
                        statementExpenseValue
                    );

            }

            if (statementBalance) {

                statementBalance.textContent =
                    currency(
                        statementBalanceValue
                    );

            }

            if (statementBody) {

                statementBody.innerHTML =
                    "";

                if (
                    !currentStatementTransactions.length
                ) {

                    statementBody.innerHTML = `

                        <tr>

                            <td colspan="5" class="empty">
                                No transactions found.
                            </td>

                        </tr>

                    `;

                } else {

                    currentStatementTransactions.forEach(
                        transaction => {

                            const row =
                                document.createElement(
                                    "tr"
                                );

                            const isIncome =
                                String(
                                    transaction.type || ""
                                ).toLowerCase() ===
                                "income";

                            // IMPORTANT:
                            // Statement also displays
                            // the real database category.
                            //
                            // Other stays Other.
                            const statementCategory =
                                getTransactionCategory(
                                    transaction
                                );

                            row.innerHTML = `

                                <td>
                                    ${formatDate(
                                        transaction.date
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        transaction.description
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        statementCategory
                                    )}
                                </td>

                                <td>

                                    <span
                                        class="badge ${
                                            isIncome
                                                ? "income"
                                                : "expense"
                                        }"
                                    >

                                        ${
                                            isIncome
                                                ? "Income"
                                                : "Expense"
                                        }

                                    </span>

                                </td>

                                <td
                                    class="${
                                        isIncome
                                            ? "income-text"
                                            : "expense-text"
                                    }"
                                >

                                    ${
                                        isIncome
                                            ? "+"
                                            : "-"
                                    }${currency(
                                        transaction.amount
                                    )}

                                </td>

                            `;

                            statementBody.appendChild(
                                row
                            );

                        }
                    );

                }

            }

            if (statementResult) {

                statementResult.classList.remove(
                    "hidden"
                );

            }

            if (
                currentStatementTransactions.length &&
                downloadStatementBtn
            ) {

                downloadStatementBtn.classList.remove(
                    "hidden"
                );

            }

        } catch (error) {

            console.error(
                "Statement error:",
                error
            );

            if (statementMessage) {

                statementMessage.textContent =
                    error.message ||
                    "Could not generate statement.";

                statementMessage.className =
                    "message error";

            }

        } finally {

            generateStatementBtn.disabled =
                false;

            generateStatementBtn.textContent =
                "Generate Statement";

        }

    }

    // =========================================================
    // DOWNLOAD STATEMENT
    // =========================================================

    if (downloadStatementBtn) {

        downloadStatementBtn.addEventListener(
            "click",
            downloadStatement
        );

    }

    function downloadStatement() {

        if (
            !currentStatementTransactions.length
        ) {

            alert(
                "There are no transactions to download."
            );

            return;

        }

        let csv =
            "Date,Description,Category,Type,Amount\n";

        currentStatementTransactions.forEach(
            transaction => {

                const descriptionValue =
                    String(
                        transaction.description ||
                        ""
                    ).replaceAll(
                        '"',
                        '""'
                    );

                // IMPORTANT:
                // CSV keeps actual database category.
                const categoryValue =
                    String(
                        getTransactionCategory(
                            transaction
                        )
                    ).replaceAll(
                        '"',
                        '""'
                    );

                const transactionType =
                    String(
                        transaction.type || ""
                    ).toLowerCase() ===
                    "income"
                        ? "Income"
                        : "Expense";

                const amountValue =
                    Number(
                        transaction.amount
                    ) || 0;

                csv +=
                    `"${transaction.date}",` +
                    `"${descriptionValue}",` +
                    `"${categoryValue}",` +
                    `"${transactionType}",` +
                    `"${amountValue.toFixed(
                        2
                    )}"\n`;

            }
        );

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement("a");

        link.href =
            url;

        link.download =
            (
                currentStatementTitle ||
                "Statement"
            )
                .replaceAll(" ", "_")
                .replaceAll("(", "")
                .replaceAll(")", "") +
            ".csv";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );

    }

    // =========================================================
    // REFRESH
    // =========================================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            async () => {

                refreshBtn.disabled =
                    true;

                const originalText =
                    refreshBtn.textContent;

                refreshBtn.textContent =
                    "Refreshing...";

                try {

                    await loadTransactions();

                } finally {

                    refreshBtn.disabled =
                        false;

                    refreshBtn.textContent =
                        originalText;

                }

            }
        );

    }

    // =========================================================
    // DATE
    // =========================================================

    function today() {

        return toDateString(
            new Date()
        );

    }

    function getCurrentMonth() {

        const d =
            new Date();

        return (
            `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}`
        );

    }

    function toDateString(
        dateObject
    ) {

        const year =
            dateObject.getFullYear();

        const month =
            String(
                dateObject.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                dateObject.getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day}`
        );

    }

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const parts =
            String(value).split("-");

        if (
            parts.length === 3
        ) {

            return (
                `${parts[2]}-${parts[1]}-${parts[0]}`
            );

        }

        return value;

    }

    function formatMonthName(
        monthKey
    ) {

        const parts =
            String(
                monthKey
            ).split("-");

        if (
            parts.length !== 2
        ) {

            return monthKey;

        }

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]);

        return new Date(
            year,
            month - 1,
            1
        ).toLocaleString(
            "en-IN",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );

    }

    // =========================================================
    // WEEK RANGE
    // =========================================================

    function getCurrentWeekRange() {

        const current =
            new Date();

        const day =
            current.getDay();

        const mondayOffset =
            day === 0
                ? -6
                : 1 - day;

        const monday =
            new Date(current);

        monday.setDate(
            current.getDate() +
            mondayOffset
        );

        monday.setHours(
            0,
            0,
            0,
            0
        );

        const sunday =
            new Date(monday);

        sunday.setDate(
            monday.getDate() +
            6
        );

        sunday.setHours(
            0,
            0,
            0,
            0
        );

        return {

            start:
                toDateString(monday),

            end:
                toDateString(sunday)

        };

    }

    // =========================================================
    // CURRENCY
    // =========================================================

    function currency(value) {

        return (
            "₹" +
            Number(
                value || 0
            ).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2
                }
            )
        );

    }

    // =========================================================
    // HTML ESCAPE
    // =========================================================

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }

    // =========================================================
    // TRANSACTION MESSAGE
    // =========================================================

    function showTransactionMessage(
        text,
        messageType
    ) {

        if (!transactionMessage) {
            return;
        }

        transactionMessage.textContent =
            text;

        transactionMessage.className =
            `message ${messageType}`;

    }

    function clearTransactionMessage() {

        if (!transactionMessage) {
            return;
        }

        transactionMessage.textContent =
            "";

        transactionMessage.className =
            "message";

    }

    // =========================================================
    // INITIALIZE
    // =========================================================

    createMonthSelector();

    await loadTransactions();

    // =========================================================
    // AUTH STATE
    // =========================================================

    supabase.auth.onAuthStateChange(
        (
            event,
            currentSession
        ) => {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                window.location.replace(
                    "auth.html"
                );

            }

        }
    );

});