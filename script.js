document.addEventListener("DOMContentLoaded", async () => {

    /* ========================================
       SUPABASE
    ======================================== */

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not found.");
        return;
    }


    /* ========================================
       CHECK LOGIN
    ======================================== */

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error(
            "Session error:",
            sessionError
        );

        window.location.replace("auth.html");
        return;
    }

    if (!session || !session.user) {
        window.location.replace("auth.html");
        return;
    }

    const user = session.user;


    /* ========================================
       PROFILE
    ======================================== */

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
        document.getElementById(
            "profileDetailName"
        );

    const profileDetailEmail =
        document.getElementById(
            "profileDetailEmail"
        );


    const userName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";


    const userEmail =
        user.email || "";


    if (profileName) {
        profileName.textContent =
            userName;
    }

    if (profileEmail) {
        profileEmail.textContent =
            userEmail;
    }

    if (profileDetailName) {
        profileDetailName.textContent =
            userName;
    }

    if (profileDetailEmail) {
        profileDetailEmail.textContent =
            userEmail;
    }


    /* ========================================
       PROFILE MENU
    ======================================== */

    if (profileBtn && profileMenu) {

        profileBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileMenu.classList.toggle(
                    "show"
                );

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !profileMenu.contains(
                        event.target
                    ) &&
                    !profileBtn.contains(
                        event.target
                    )
                ) {

                    profileMenu.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* ========================================
       LOGOUT
    ======================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function () {

                logoutBtn.disabled = true;

                logoutBtn.textContent =
                    "Logging out...";


                const {
                    error
                } =
                    await supabase.auth.signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    alert(
                        "Logout failed. Please try again."
                    );

                    logoutBtn.disabled =
                        false;

                    logoutBtn.textContent =
                        "Logout";

                    return;
                }


                window.location.replace(
                    "auth.html"
                );

            }
        );

    }


    /* ========================================
       TRANSACTION ELEMENTS
    ======================================== */

    const transactionForm =
        document.getElementById(
            "transactionForm"
        );

    const descriptionInput =
        document.getElementById(
            "description"
        );

    const amountInput =
        document.getElementById(
            "amount"
        );

    const categoryInput =
        document.getElementById(
            "category"
        );

    const typeInput =
        document.getElementById(
            "type"
        );

    const dateInput =
        document.getElementById(
            "date"
        );

    const addTransactionBtn =
        document.getElementById(
            "addTransactionBtn"
        );

    const transactionMessage =
        document.getElementById(
            "transactionMessage"
        );

    const transactionsBody =
        document.getElementById(
            "transactionsBody"
        );

    const loadingTransactions =
        document.getElementById(
            "loadingTransactions"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    /* ========================================
       SEARCH ELEMENT
    ======================================== */

    const transactionSearch =
        document.getElementById(
            "transactionSearch"
        );


    /* ========================================
       STORE ALL TRANSACTIONS
    ======================================== */

    let allTransactions = [];


    /* ========================================
       SET TODAY'S DATE
    ======================================== */

    if (dateInput) {

        dateInput.value =
            getToday();

    }


    /* ========================================
       ADD TRANSACTION
    ======================================== */

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                clearTransactionMessage();


                const description =
                    descriptionInput
                        ? descriptionInput.value.trim()
                        : "";


                const amount =
                    amountInput
                        ? Number(
                            amountInput.value
                        )
                        : 0;


                const category =
                    categoryInput
                        ? categoryInput.value
                        : "";


                const type =
                    typeInput
                        ? typeInput.value
                        : "expense";


                const date =
                    dateInput
                        ? dateInput.value
                        : "";


                /* Validation */

                if (!description) {

                    showTransactionMessage(
                        "Please enter a description.",
                        "error"
                    );

                    return;
                }


                if (
                    !amount ||
                    amount <= 0
                ) {

                    showTransactionMessage(
                        "Please enter a valid amount.",
                        "error"
                    );

                    return;
                }


                if (!category) {

                    showTransactionMessage(
                        "Please select a category.",
                        "error"
                    );

                    return;
                }


                if (!date) {

                    showTransactionMessage(
                        "Please select a date.",
                        "error"
                    );

                    return;
                }


                /* Disable button */

                if (addTransactionBtn) {

                    addTransactionBtn.disabled =
                        true;

                    addTransactionBtn.textContent =
                        "Adding...";

                }


                try {

                    const {
                        error
                    } =
                        await supabase
                            .from("transactions")
                            .insert({

                                user_id:
                                    user.id,

                                description:
                                    description,

                                amount:
                                    amount,

                                category:
                                    category,

                                type:
                                    type,

                                date:
                                    date

                            });


                    if (error) {
                        throw error;
                    }


                    showTransactionMessage(
                        "Transaction added successfully.",
                        "success"
                    );


                    transactionForm.reset();


                    if (dateInput) {

                        dateInput.value =
                            getToday();

                    }


                    if (typeInput) {

                        typeInput.value =
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

                    if (addTransactionBtn) {

                        addTransactionBtn.disabled =
                            false;

                        addTransactionBtn.textContent =
                            "Add Transaction";

                    }

                }

            }
        );

    }


    /* ========================================
       LOAD TRANSACTIONS
    ======================================== */

    async function loadTransactions() {

        if (loadingTransactions) {

            loadingTransactions.style.display =
                "block";

            loadingTransactions.textContent =
                "Loading transactions...";

        }


        if (transactionsBody) {

            transactionsBody.innerHTML =
                "";

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


            if (loadingTransactions) {

                loadingTransactions.style.display =
                    "none";

            }


            displayTransactions(
                allTransactions
            );


            updateSummary(
                allTransactions
            );


        } catch (error) {

            console.error(
                "Load transactions error:",
                error
            );


            allTransactions = [];


            if (loadingTransactions) {

                loadingTransactions.textContent =
                    "Could not load transactions.";

            }


            if (transactionsBody) {

                transactionsBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            Could not load transactions.
                        </td>

                    </tr>

                `;

            }

        }

    }


    /* ========================================
       DISPLAY TRANSACTIONS
    ======================================== */

    function displayTransactions(
        transactions
    ) {

        if (!transactionsBody) {

            console.error(
                "transactionsBody not found."
            );

            return;
        }


        transactionsBody.innerHTML =
            "";


        if (
            !transactions ||
            transactions.length === 0
        ) {

            transactionsBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="empty"
                    >
                        No transactions found.
                    </td>

                </tr>

            `;

            return;
        }


        transactions.forEach(
            function (transaction) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const transactionType =
                    String(
                        transaction.type ||
                        "expense"
                    ).toLowerCase();


                const isIncome =
                    transactionType ===
                    "income";


                const description =
                    escapeHtml(
                        transaction.description ||
                        ""
                    );


                const category =
                    escapeHtml(
                        transaction.category ||
                        ""
                    );


                const date =
                    formatDate(
                        transaction.date
                    );


                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const formattedAmount =
                    amount.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


                row.innerHTML = `

                    <td>
                        ${description}
                    </td>

                    <td>
                        ${category}
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
                        ${date}
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
                        }₹${formattedAmount}

                    </td>

                    <td>

                        <button
                            type="button"
                            class="delete-btn"
                            data-id="${
                                transaction.id
                            }"
                        >
                            Delete
                        </button>

                    </td>

                `;


                transactionsBody.appendChild(
                    row
                );

            }
        );


        /* ====================================
           DELETE BUTTONS
        ==================================== */

        const deleteButtons =
            transactionsBody.querySelectorAll(
                ".delete-btn"
            );


        deleteButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteTransaction(
                            button.dataset.id
                        );

                    }
                );

            }
        );

    }


    /* ========================================
       SEARCH TRANSACTIONS
    ======================================== */

    if (transactionSearch) {

        transactionSearch.addEventListener(
            "input",
            function () {

                const searchText =
                    transactionSearch.value
                        .trim()
                        .toLowerCase();


                /* Empty search = show all */

                if (!searchText) {

                    displayTransactions(
                        allTransactions
                    );

                    return;
                }


                const filtered =
                    allTransactions.filter(
                        function (transaction) {

                            const description =
                                String(
                                    transaction.description ||
                                    ""
                                ).toLowerCase();


                            const category =
                                String(
                                    transaction.category ||
                                    ""
                                ).toLowerCase();


                            const type =
                                String(
                                    transaction.type ||
                                    ""
                                ).toLowerCase();


                            const date =
                                String(
                                    transaction.date ||
                                    ""
                                ).toLowerCase();


                            const amount =
                                String(
                                    transaction.amount ||
                                    ""
                                ).toLowerCase();


                            return (

                                description.includes(
                                    searchText
                                )

                                ||

                                category.includes(
                                    searchText
                                )

                                ||

                                type.includes(
                                    searchText
                                )

                                ||

                                date.includes(
                                    searchText
                                )

                                ||

                                amount.includes(
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


    /* ========================================
       DELETE TRANSACTION
    ======================================== */

    async function deleteTransaction(id) {

        const confirmed =
            confirm(
                "Delete this transaction?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                error
            } =
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


    /* ========================================
       UPDATE SUMMARY
    ======================================== */

    function updateSummary(
        transactions
    ) {

        let income =
            0;

        let expense =
            0;


        transactions.forEach(
            function (transaction) {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const type =
                    String(
                        transaction.type ||
                        "expense"
                    ).toLowerCase();


                if (
                    type ===
                    "income"
                ) {

                    income += amount;

                } else {

                    expense += amount;

                }

            }
        );


        const balance =
            income - expense;


        const incomeElement =
            document.getElementById(
                "income"
            );


        const expenseElement =
            document.getElementById(
                "expense"
            );


        const balanceElement =
            document.getElementById(
                "balance"
            );


        if (incomeElement) {

            incomeElement.textContent =
                currency(income);

        }


        if (expenseElement) {

            expenseElement.textContent =
                currency(expense);

        }


        if (balanceElement) {

            balanceElement.textContent =
                currency(balance);

        }


        const savingMessage =
            document.getElementById(
                "savingMessage"
            );


        if (savingMessage) {

            if (balance > 0) {

                savingMessage.textContent =
                    "You are saving money.";

            } else if (balance < 0) {

                savingMessage.textContent =
                    "Your expenses are higher than your income.";

            } else {

                savingMessage.textContent =
                    "Your balance is zero.";

            }

        }

    }


    /* ========================================
       STATEMENT ELEMENTS
    ======================================== */

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


    /* ========================================
       DEFAULT MONTH
    ======================================== */

    if (statementMonth) {

        statementMonth.value =
            currentMonth();

    }


    /* ========================================
       STATEMENT TYPE
    ======================================== */

    if (statementType) {

        statementType.addEventListener(
            "change",
            function () {

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

                }

            }
        );

    }


    /* ========================================
       GENERATE STATEMENT
    ======================================== */

    if (generateStatementBtn) {

        generateStatementBtn.addEventListener(
            "click",
            generateStatement
        );

    }


    async function generateStatement() {

        if (!statementType) {
            return;
        }


        if (statementMessage) {

            statementMessage.textContent =
                "";

            statementMessage.className =
                "message";

        }


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


        generateStatementBtn.disabled =
            true;


        generateStatementBtn.textContent =
            "Generating...";


        try {

            let startDate;

            let endDate;

            let title;


            /* =================================
               MONTHLY
            ================================= */

            if (
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
                    statementMonth.value
                        .split("-");


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


                const monthName =
                    new Date(
                        year,
                        month - 1,
                        1
                    ).toLocaleString(
                        "en-IN",
                        {
                            month: "long"
                        }
                    );


                title =
                    `${monthName} ${year} Statement`;

            }


            /* =================================
               WEEKLY
            ================================= */

            else {

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


            /* =================================
               LOAD STATEMENT
            ================================= */

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


            const transactions =
                data || [];


            currentStatementTransactions =
                transactions;


            currentStatementTitle =
                title;


            /* =================================
               CALCULATE TOTALS
            ================================= */

            let income =
                0;


            let expense =
                0;


            transactions.forEach(
                function (transaction) {

                    const amount =
                        Number(
                            transaction.amount
                        ) || 0;


                    const type =
                        String(
                            transaction.type ||
                            "expense"
                        ).toLowerCase();


                    if (
                        type ===
                        "income"
                    ) {

                        income += amount;

                    } else {

                        expense += amount;

                    }

                }
            );


            const balance =
                income - expense;


            /* =================================
               SHOW SUMMARY
            ================================= */

            if (statementTitle) {

                statementTitle.textContent =
                    title;

            }


            if (statementIncome) {

                statementIncome.textContent =
                    currency(income);

            }


            if (statementExpense) {

                statementExpense.textContent =
                    currency(expense);

            }


            if (statementBalance) {

                statementBalance.textContent =
                    currency(balance);

            }


            /* =================================
               STATEMENT TABLE
            ================================= */

            if (statementBody) {

                statementBody.innerHTML =
                    "";

            }


            if (!transactions.length) {

                if (statementBody) {

                    statementBody.innerHTML = `

                        <tr>

                            <td
                                colspan="5"
                                class="empty"
                            >
                                No transactions found for this period.
                            </td>

                        </tr>

                    `;

                }

            } else {

                transactions.forEach(
                    function (transaction) {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        const type =
                            String(
                                transaction.type ||
                                "expense"
                            ).toLowerCase();


                        const isIncome =
                            type ===
                            "income";


                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;


                        const formattedAmount =
                            amount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            );


                        row.innerHTML = `

                            <td>
                                ${formatDate(
                                    transaction.date
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    transaction.description ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    transaction.category ||
                                    ""
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
                                }₹${formattedAmount}

                            </td>

                        `;


                        if (statementBody) {

                            statementBody.appendChild(
                                row
                            );

                        }

                    }
                );

            }


            if (statementResult) {

                statementResult.classList.remove(
                    "hidden"
                );

            }


            if (
                transactions.length > 0 &&
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


    /* ========================================
       DOWNLOAD STATEMENT
    ======================================== */

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
            function (transaction) {

                const description =
                    String(
                        transaction.description ||
                        ""
                    )
                    .replaceAll(
                        '"',
                        '""'
                    );


                const category =
                    String(
                        transaction.category ||
                        ""
                    )
                    .replaceAll(
                        '"',
                        '""'
                    );


                const type =
                    String(
                        transaction.type ||
                        "expense"
                    ).toLowerCase();


                const typeName =
                    type === "income"
                        ? "Income"
                        : "Expense";


                const amount =
                    Number(
                        transaction.amount
                    ).toFixed(2);


                csv +=
                    `"${transaction.date}",` +
                    `"${description}",` +
                    `"${category}",` +
                    `"${typeName}",` +
                    `"${amount}"\n`;

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
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            currentStatementTitle
                .replaceAll(
                    " ",
                    "_"
                )
                .replaceAll(
                    "(",
                    ""
                )
                .replaceAll(
                    ")",
                    ""
                )
                + ".csv";


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


    /* ========================================
       CURRENT WEEK
    ======================================== */

    function getCurrentWeekRange() {

        const now =
            new Date();


        const day =
            now.getDay();


        const mondayOffset =
            day === 0
                ? -6
                : 1 - day;


        const monday =
            new Date(now);


        monday.setDate(
            now.getDate() +
            mondayOffset
        );


        const sunday =
            new Date(monday);


        sunday.setDate(
            monday.getDate() +
            6
        );


        return {

            start:
                toDateString(
                    monday
                ),

            end:
                toDateString(
                    sunday
                )

        };

    }


    /* ========================================
       DATE FUNCTIONS
    ======================================== */

    function getToday() {

        return toDateString(
            new Date()
        );

    }


    function toDateString(
        date
    ) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    function currentMonth() {

        const date =
            new Date();


        return (
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )
        );

    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }


        const parts =
            String(value)
                .split("-");


        if (
            parts.length === 3
        ) {

            return (
                parts[2] +
                "-" +
                parts[1] +
                "-" +
                parts[0]
            );

        }


        return value;

    }


    /* ========================================
       CURRENCY
    ======================================== */

    function currency(
        value
    ) {

        return (
            "₹" +
            Number(
                value
            ).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }


    /* ========================================
       HTML SECURITY
    ======================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value
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


    /* ========================================
       MESSAGE
    ======================================== */

    function showTransactionMessage(
        text,
        type
    ) {

        if (!transactionMessage) {
            return;
        }


        transactionMessage.textContent =
            text;


        transactionMessage.className =
            "message " + type;

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


    /* ========================================
       REFRESH
    ======================================== */

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            async function () {

                await loadTransactions();

            }
        );

    }


    /* ========================================
       INITIAL LOAD
    ======================================== */

    await loadTransactions();


    /* ========================================
       AUTH STATE
    ======================================== */

    supabase.auth.onAuthStateChange(
        function (
            event,
            currentSession
        ) {

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