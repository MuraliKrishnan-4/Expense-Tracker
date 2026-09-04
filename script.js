document.addEventListener("DOMContentLoaded", async () => {

    // ========================================
    // SUPABASE
    // ========================================

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not found.");
        return;
    }


    // ========================================
    // CHECK LOGIN
    // ========================================

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("auth.html");
        return;
    }

    const user = session.user;


    // ========================================
    // USER PROFILE
    // ========================================

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


    // ========================================
    // PROFILE MENU
    // ========================================

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


    // ========================================
    // LOGOUT
    // ========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                logoutBtn.disabled = true;

                logoutBtn.textContent =
                    "Logging out...";


                const { error } =
                    await supabase.auth.signOut();


                if (error) {

                    console.error(error);

                    alert(
                        "Logout failed. Please try again."
                    );

                    logoutBtn.disabled = false;

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


    // ========================================
    // TRANSACTION ELEMENTS
    // ========================================

    const form =
        document.getElementById(
            "transactionForm"
        );

    const description =
        document.getElementById(
            "description"
        );

    const amount =
        document.getElementById(
            "amount"
        );

    const category =
        document.getElementById(
            "category"
        );

    const type =
        document.getElementById(
            "type"
        );

    const date =
        document.getElementById(
            "date"
        );

    const addBtn =
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

    const loading =
        document.getElementById(
            "loadingTransactions"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    // ========================================
    // IMPORTANT
    // SEARCH
    // ========================================

    // HTML uses:
    // id="transactionSearch"

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );


    // ========================================
    // SUMMARY ELEMENTS
    // ========================================

    const balanceEl =
        document.getElementById(
            "balance"
        );

    const incomeEl =
        document.getElementById(
            "income"
        );

    const expenseEl =
        document.getElementById(
            "expense"
        );

    const savingMessage =
        document.getElementById(
            "savingMessage"
        );


    // ========================================
    // TRANSACTION DATA
    // ========================================

    let allTransactions = [];


    // ========================================
    // DEFAULT DATE
    // ========================================

    if (date) {
        date.value = today();
    }


    // ========================================
    // ADD TRANSACTION
    // ========================================

    if (form) {

        form.addEventListener(
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


                if (addBtn) {

                    addBtn.disabled = true;

                    addBtn.textContent =
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


                    form.reset();


                    if (date) {
                        date.value = today();
                    }


                    if (type) {
                        type.value = "expense";
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

                    if (addBtn) {

                        addBtn.disabled = false;

                        addBtn.textContent =
                            "Add Transaction";

                    }

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

            loading.textContent =
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


            if (loading) {

                loading.style.display =
                    "none";

            }


            displayTransactions(
                allTransactions
            );

            updateSummary(
                allTransactions
            );

            updateChart(
                allTransactions
            );


        } catch (error) {

            console.error(
                "Load transactions error:",
                error
            );


            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    "Could not load transactions.";

            }

        }

    }


    // ========================================
    // DISPLAY TRANSACTIONS
    // ========================================

    function displayTransactions(items) {

        if (!transactionsBody) {
            return;
        }


        transactionsBody.innerHTML = "";


        if (!items || !items.length) {

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


        items.forEach(
            transaction => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const isIncome =
                    String(
                        transaction.type || ""
                    ).toLowerCase() ===
                    "income";


                const amountValue =
                    Number(
                        transaction.amount
                    ) || 0;


                tr.innerHTML = `

                    <td>
                        ${escapeHtml(
                            transaction.description
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            transaction.category
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
                        }₹${amountValue.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </td>


                    <td>

                        <div
                            class="transaction-actions"
                        >

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
                    tr
                );

            }
        );


        // ====================================
        // EDIT BUTTON
        // ====================================

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


        // ====================================
        // DELETE BUTTON
        // ====================================

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


    // ========================================
    // SEARCH
    // ========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const text =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!text) {

                    displayTransactions(
                        allTransactions
                    );

                    return;

                }


                const filtered =
                    allTransactions.filter(
                        transaction => {

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

                            const transactionType =
                                String(
                                    transaction.type ||
                                    ""
                                ).toLowerCase();

                            const rawDate =
                                String(
                                    transaction.date ||
                                    ""
                                ).toLowerCase();

                            const displayDate =
                                formatDate(
                                    transaction.date
                                ).toLowerCase();

                            const amountText =
                                String(
                                    transaction.amount ||
                                    ""
                                ).toLowerCase();

                            const formattedAmount =
                                Number(
                                    transaction.amount ||
                                    0
                                )
                                    .toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )
                                    .toLowerCase();


                            return (

                                description.includes(
                                    text
                                )

                                ||

                                category.includes(
                                    text
                                )

                                ||

                                transactionType.includes(
                                    text
                                )

                                ||

                                rawDate.includes(
                                    text
                                )

                                ||

                                displayDate.includes(
                                    text
                                )

                                ||

                                amountText.includes(
                                    text
                                )

                                ||

                                formattedAmount.includes(
                                    text
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


    // ========================================
    // DELETE TRANSACTION
    // ========================================

    async function deleteTransaction(id) {

        if (
            !confirm(
                "Delete this transaction?"
            )
        ) {

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


    // ========================================
    // SUMMARY
    // ========================================

    function updateSummary(items) {

        let income = 0;

        let expense = 0;


        items.forEach(
            transaction => {

                const value =
                    Number(
                        transaction.amount
                    ) || 0;


                const transactionType =
                    String(
                        transaction.type
                    ).toLowerCase();


                if (
                    transactionType ===
                    "income"
                ) {

                    income += value;

                } else {

                    expense += value;

                }

            }
        );


        const balance =
            income - expense;


        if (incomeEl) {

            incomeEl.textContent =
                currency(income);

        }


        if (expenseEl) {

            expenseEl.textContent =
                currency(expense);

        }


        if (balanceEl) {

            balanceEl.textContent =
                currency(balance);

        }


        if (savingMessage) {

            if (balance > 0) {

                savingMessage.textContent =
                    "You are saving money.";

            }

            else if (balance < 0) {

                savingMessage.textContent =
                    "Your expenses are higher than your income.";

            }

            else {

                savingMessage.textContent =
                    "Your balance is zero.";

            }

        }

    }


    // ========================================
    // EXPENSE CHART
    // ========================================

    let expenseChart = null;


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
            typeof Chart ===
            "undefined"
        ) {

            console.error(
                "Chart.js is not loaded."
            );

            return;

        }


        const categories = {};


        items.forEach(
            transaction => {

                if (
                    String(
                        transaction.type || ""
                    ).toLowerCase() !==
                    "expense"
                ) {

                    return;

                }


                const name =
                    String(
                        transaction.category ||
                        "Other"
                    );


                const value =
                    Number(
                        transaction.amount
                    ) || 0;


                if (value <= 0) {
                    return;
                }


                categories[name] =
                    (
                        categories[name] ||
                        0
                    ) + value;

            }
        );


        const labels =
            Object.keys(
                categories
            );


        const values =
            Object.values(
                categories
            );


        if (expenseChart) {

            expenseChart.destroy();

            expenseChart =
                null;

        }


        if (chartLegend) {

            chartLegend.innerHTML =
                "";

        }


        if (!labels.length) {

            canvas.style.display =
                "none";


            if (chartEmpty) {

                chartEmpty.style.display =
                    "flex";

            }


            return;

        }


        canvas.style.display =
            "block";


        if (chartEmpty) {

            chartEmpty.style.display =
                "none";

        }


        // ====================================
        // CHART COLORS
        // ====================================

        const chartColors = [

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
                                            chartColors[
                                                index %
                                                chartColors.length
                                            ]
                                    ),

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
                            "58%",


                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        context => {

                                            const value =
                                                Number(
                                                    context.raw
                                                ) || 0;


                                            const total =
                                                values.reduce(
                                                    (
                                                        sum,
                                                        item
                                                    ) =>
                                                        sum +
                                                        Number(
                                                            item
                                                        ),
                                                    0
                                                );


                                            const percentage =
                                                total > 0
                                                    ? (
                                                        value /
                                                        total
                                                    ) *
                                                    100
                                                    : 0;


                                            return (
                                                `${context.label}: ₹` +
                                                value.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                ) +
                                                ` (${percentage.toFixed(1)}%)`
                                            );

                                        }

                                }

                            }

                        }

                    }

                }
            );


        // ====================================
        // CUSTOM LEGEND
        // ====================================

        if (chartLegend) {

            const total =
                values.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum +
                        Number(value),
                    0
                );


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
                        total > 0
                            ? (
                                value /
                                total
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
                        chartColors[
                            index %
                            chartColors.length
                        ];


                    const text =
                        document.createElement(
                            "span"
                        );


                    text.textContent =
                        `${label} • ${currency(value)} (${percentage.toFixed(1)}%)`;


                    item.appendChild(
                        dot
                    );

                    item.appendChild(
                        text
                    );

                    chartLegend.appendChild(
                        item
                    );

                }
            );

        }

    }


    // ========================================
    // EDIT MODAL ELEMENTS
    // ========================================

    const editModal =
        document.getElementById(
            "editModal"
        );

    const editForm =
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

    const editMessage =
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


    // ========================================
    // OPEN EDIT MODAL
    // ========================================

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


        if (editMessage) {

            editMessage.textContent =
                "";

            editMessage.className =
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


    // ========================================
    // CLOSE EDIT MODAL
    // ========================================

    function closeEditModal() {

        if (editModal) {

            editModal.classList.remove(
                "show"
            );

            editModal.classList.add(
                "hidden"
            );

        }


        if (editForm) {

            editForm.reset();

        }


        if (editTransactionId) {

            editTransactionId.value =
                "";

        }


        if (editMessage) {

            editMessage.textContent =
                "";

            editMessage.className =
                "message";

        }

    }


    // ========================================
    // CLOSE BUTTONS
    // ========================================

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


    // ========================================
    // CLICK OUTSIDE MODAL
    // ========================================

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


    // ========================================
    // ESC KEY
    // ========================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
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


    // ========================================
    // SAVE EDITED TRANSACTION
    // ========================================

    if (editForm) {

        editForm.addEventListener(
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

                    const {
                        error
                    } =
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


    // ========================================
    // EDIT MESSAGE
    // ========================================

    function showEditMessage(
        text,
        messageType
    ) {

        if (!editMessage) {
            return;
        }


        editMessage.textContent =
            text;

        editMessage.className =
            `message ${messageType}`;

    }


    // ========================================
    // STATEMENT ELEMENTS
    // ========================================

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


    // ========================================
    // DEFAULT MONTH
    // ========================================

    if (statementMonth) {

        statementMonth.value =
            currentMonth();

    }


    // ========================================
    // STATEMENT TYPE CHANGE
    // ========================================

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

            }
        );

    }


    // ========================================
    // GENERATE STATEMENT
    // ========================================

    if (generateStatementBtn) {

        generateStatementBtn.addEventListener(
            "click",
            generateStatement
        );

    }


    async function generateStatement() {

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


        if (generateStatementBtn) {

            generateStatementBtn.disabled =
                true;

            generateStatementBtn.textContent =
                "Generating...";

        }


        try {

            let startDate;

            let endDate;

            let title;


            // ====================================
            // MONTHLY
            // ====================================

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


                const [
                    year,
                    month
                ] =
                    statementMonth.value
                        .split("-")
                        .map(Number);


                startDate =
                    `${year}-${String(month).padStart(2, "0")}-01`;


                const lastDay =
                    new Date(
                        year,
                        month,
                        0
                    ).getDate();


                endDate =
                    `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;


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

            // ====================================
            // WEEKLY
            // ====================================

            else {

                const range =
                    getCurrentWeekRange();


                startDate =
                    range.start;

                endDate =
                    range.end;


                title =
                    `Weekly Statement (${formatDate(startDate)} to ${formatDate(endDate)})`;

            }


            // ====================================
            // GET DATA
            // ====================================

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


            // ====================================
            // TOTALS
            // ====================================

            let income = 0;

            let expense = 0;


            transactions.forEach(
                transaction => {

                    const value =
                        Number(
                            transaction.amount
                        ) || 0;


                    if (
                        String(
                            transaction.type
                        ).toLowerCase() ===
                        "income"
                    ) {

                        income += value;

                    } else {

                        expense += value;

                    }

                }
            );


            const balance =
                income - expense;


            // ====================================
            // DISPLAY
            // ====================================

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
                    transaction => {

                        const tr =
                            document.createElement(
                                "tr"
                            );


                        const isIncome =
                            String(
                                transaction.type
                            ).toLowerCase() ===
                            "income";


                        tr.innerHTML = `

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
                                    transaction.category
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
                            tr
                        );

                    }
                );

            }


            if (statementResult) {

                statementResult.classList.remove(
                    "hidden"
                );

            }


            if (
                transactions.length &&
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

            if (generateStatementBtn) {

                generateStatementBtn.disabled =
                    false;

                generateStatementBtn.textContent =
                    "Generate Statement";

            }

        }

    }
    // ========================================
    // DOWNLOAD STATEMENT
    // ========================================

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


                const transactionType =
                    String(
                        transaction.type ||
                        ""
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
                    `"${description}",` +
                    `"${category}",` +
                    `"${transactionType}",` +
                    `"${amountValue.toFixed(2)}"\n`;

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
            (
                currentStatementTitle ||
                "Statement"
            )
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
                ) +
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


    // ========================================
    // CURRENT WEEK
    // ========================================

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
            new Date(
                current
            );


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
            new Date(
                monday
            );


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
                toDateString(
                    monday
                ),

            end:
                toDateString(
                    sunday
                )

        };

    }


    // ========================================
    // DATE HELPERS
    // ========================================

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


    function today() {

        return toDateString(
            new Date()
        );

    }


    function currentMonth() {

        const d =
            new Date();


        return (
            `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`
        );

    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }


        const parts =
            String(value).split("-");


        if (
            parts.length ===
            3
        ) {

            return (
                `${parts[2]}-${parts[1]}-${parts[0]}`
            );

        }


        return value;

    }


    // ========================================
    // CURRENCY
    // ========================================

    function currency(
        value
    ) {

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


    // ========================================
    // HTML ESCAPE
    // ========================================

    function escapeHtml(
        value
    ) {

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


    // ========================================
    // TRANSACTION MESSAGE
    // ========================================

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


    // ========================================
    // REFRESH
    // ========================================

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


    // ========================================
    // INITIAL LOAD
    // ========================================

    await loadTransactions();


    // ========================================
    // AUTH STATE
    // ========================================

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

                return;

            }


            if (!currentSession) {

                window.location.replace(
                    "auth.html"
                );

            }

        }
    );

});