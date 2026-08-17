// ========================================
// GET ELEMENTS
// ========================================

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


const customCategoryBox =
    document.getElementById(
        "customCategoryBox"
    );


const customCategoryInput =
    document.getElementById(
        "customCategory"
    );


const typeInput =
    document.getElementById(
        "type"
    );


const dateInput =
    document.getElementById(
        "transactionDate"
    );


const transactionList =
    document.getElementById(
        "transactionList"
    );


const balanceElement =
    document.getElementById(
        "balance"
    );


const totalIncomeElement =
    document.getElementById(
        "totalIncome"
    );


const totalExpenseElement =
    document.getElementById(
        "totalExpense"
    );


const loadingElement =
    document.getElementById(
        "loading"
    );


const emptyMessageElement =
    document.getElementById(
        "emptyMessage"
    );


const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const profileBtn =
    document.getElementById(
        "profileBtn"
    );


const profileMenu =
    document.getElementById(
        "profileMenu"
    );


const profileName =
    document.getElementById(
        "profileName"
    );


const profileEmail =
    document.getElementById(
        "profileEmail"
    );


// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(

        "en-IN",

        {

            style:
                "currency",

            currency:
                "INR",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }

    ).format(
        Number(amount)
    );

}


// ========================================
// GET TODAY DATE
// ========================================

function setTodayDate() {

    if (!dateInput) {

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


    dateInput.value =
        year +
        "-" +
        month +
        "-" +
        day;

}


// ========================================
// FORMAT DATE FOR DISPLAY
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "";

    }


    const parts =
        dateValue.split(
            "-"
        );


    if (
        parts.length !== 3
    ) {

        return dateValue;

    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}


// ========================================
// CHECK USER SESSION
// ========================================

async function checkUserSession() {

    const session =
        getSession();


    if (
        !session ||
        !session.access_token
    ) {

        removeSession();


        window.location.href =
            "auth.html";


        return false;

    }


    if (
        isSessionExpired()
    ) {

        const refreshedSession =
            await refreshSession();


        if (
            !refreshedSession ||
            !refreshedSession.access_token
        ) {

            removeSession();


            window.location.href =
                "auth.html";


            return false;

        }

    }


    return true;

}


// ========================================
// GET VALID DATABASE HEADERS
// ========================================

async function getValidDatabaseHeaders() {

    const validSession =
        await checkUserSession();


    if (!validSession) {

        return null;

    }


    return getDatabaseHeaders();

}


// ========================================
// LOAD PROFILE
// ========================================

function loadProfile() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    let name =
        "User";


    if (
        user.user_metadata &&
        user.user_metadata.full_name
    ) {

        name =
            user.user_metadata.full_name;

    }


    else if (
        user.email
    ) {

        name =
            user.email
                .split("@")[0];

    }


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email ||
            "";

    }

}


// ========================================
// PROFILE BUTTON
// ========================================

if (profileBtn) {

    profileBtn.addEventListener(

        "click",

        function () {

            if (!profileMenu) {

                return;

            }


            profileMenu.classList.toggle(
                "show"
            );

        }

    );

}


// ========================================
// CLOSE PROFILE MENU
// ========================================

document.addEventListener(

    "click",

    function (event) {

        if (
            !profileBtn ||
            !profileMenu
        ) {

            return;

        }


        if (
            !profileBtn.contains(event.target) &&
            !profileMenu.contains(event.target)
        ) {

            profileMenu.classList.remove(
                "show"
            );

        }

    }

);


// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        async function () {

            const session =
                getSession();


            try {

                if (
                    session &&
                    session.access_token
                ) {

                    await fetch(

                        SUPABASE_URL +
                        "/auth/v1/logout",

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    session.access_token

                            }

                        }

                    );

                }

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            // Remove only login session

            removeSession();


            // Remove browser autofill focus

            if (descriptionInput) {

                descriptionInput.value =
                    "";

            }


            if (amountInput) {

                amountInput.value =
                    "";

            }


            // Redirect to login page

            window.location.href =
                "auth.html";

        }

    );

}


// ========================================
// CATEGORY CHANGE
// ========================================

if (categoryInput) {

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
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ========================================
// ADD TRANSACTION
// ========================================

if (transactionForm) {

    transactionForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            const validSession =
                await checkUserSession();


            if (!validSession) {

                return;

            }


            const description =
                descriptionInput.value.trim();


            const amount =
                Number(
                    amountInput.value
                );


            let category =
                categoryInput.value;


            const type =
                typeInput.value;


            const transactionDate =
                dateInput.value;


            // ========================================
            // VALIDATE DESCRIPTION
            // ========================================

            if (!description) {

                alert(
                    "Please enter a description."
                );


                return;

            }


            // ========================================
            // VALIDATE AMOUNT
            // ========================================

            if (
                !amount ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );


                return;

            }


            // ========================================
            // VALIDATE CATEGORY
            // ========================================

            if (!category) {

                alert(
                    "Please select a category."
                );


                return;

            }


            // ========================================
            // OTHER CATEGORY
            // ========================================

            if (
                category ===
                "Other"
            ) {

                const customCategory =
                    customCategoryInput
                        .value
                        .trim();


                if (!customCategory) {

                    alert(
                        "Please enter your category."
                    );


                    return;

                }


                category =
                    customCategory;

            }


            // ========================================
            // VALIDATE DATE
            // ========================================

            if (!transactionDate) {

                alert(
                    "Please select a date."
                );


                return;

            }


            // ========================================
            // GET CURRENT USER
            // ========================================

            const user =
                getCurrentUser();


            if (!user) {

                removeSession();


                window.location.href =
                    "auth.html";


                return;

            }


            // ========================================
            // DISABLE BUTTON
            // ========================================

            const button =
                transactionForm.querySelector(
                    ".add-btn"
                );


            button.disabled =
                true;


            button.textContent =
                "Adding...";


            try {

                let headers =
                    getDatabaseHeaders();


                if (!headers) {

                    const refreshedSession =
                        await refreshSession();


                    if (
                        !refreshedSession
                    ) {

                        throw new Error(
                            "Session expired. Please login again."
                        );

                    }


                    headers =
                        getDatabaseHeaders();

                }


                // ========================================
                // TRANSACTION DATA
                // ========================================

                const transactionData = {

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

                    transaction_date:
                        transactionDate

                };


                const response =

                    await fetch(

                        SUPABASE_URL +
                        "/rest/v1/transactions",

                        {

                            method:
                                "POST",

                            headers:
                                {

                                    ...headers,

                                    "Prefer":
                                        "return=representation"

                                },

                            body:
                                JSON.stringify(
                                    transactionData
                                )

                        }

                    );


                // ========================================
                // JWT EXPIRED - REFRESH AND RETRY
                // ========================================

                if (
                    response.status ===
                    401
                ) {

                    const refreshedSession =
                        await refreshSession();


                    if (
                        !refreshedSession
                    ) {

                        removeSession();


                        alert(
                            "Your session has expired. Please login again."
                        );


                        window.location.href =
                            "auth.html";


                        return;

                    }


                    const newHeaders =
                        getDatabaseHeaders();


                    const retryResponse =

                        await fetch(

                            SUPABASE_URL +
                            "/rest/v1/transactions",

                            {

                                method:
                                    "POST",

                                headers:
                                    {

                                        ...newHeaders,

                                        "Prefer":
                                            "return=representation"

                                    },

                                body:
                                    JSON.stringify(
                                        transactionData
                                    )

                            }

                        );


                    if (
                        !retryResponse.ok
                    ) {

                        const retryText =
                            await retryResponse.text();


                        let retryData = {};


                        if (retryText) {

                            try {

                                retryData =
                                    JSON.parse(
                                        retryText
                                    );

                            }

                            catch (error) {

                                console.error(
                                    retryText
                                );

                            }

                        }


                        throw new Error(

                            retryData.message ||

                            retryData.hint ||

                            retryData.details ||

                            "Could not add transaction."

                        );

                    }

                }

                else if (
                    !response.ok
                ) {

                    const text =
                        await response.text();


                    let data = {};


                    if (text) {

                        try {

                            data =
                                JSON.parse(
                                    text
                                );

                        }

                        catch (error) {

                            console.error(
                                text
                            );

                        }

                    }


                    throw new Error(

                        data.message ||

                        data.hint ||

                        data.details ||

                        "Could not add transaction."

                    );

                }


                // ========================================
                // SUCCESS
                // ========================================

                transactionForm.reset();


                customCategoryBox.classList.add(
                    "hidden"
                );


                customCategoryInput.required =
                    false;


                setTodayDate();


                await loadTransactions();

            }

            catch (error) {

                alert(

                    "Error adding transaction: " +

                    error.message

                );

            }

            finally {

                button.disabled =
                    false;


                button.textContent =
                    "Add Transaction";

            }

        }

    );

}


// ========================================
// LOAD TRANSACTIONS
// ========================================

async function loadTransactions() {

    const validSession =
        await checkUserSession();


    if (!validSession) {

        return;

    }


    if (loadingElement) {

        loadingElement.style.display =
            "block";

    }


    if (emptyMessageElement) {

        emptyMessageElement.style.display =
            "none";

    }


    if (transactionList) {

        transactionList.innerHTML =
            "";

    }


    try {

        const user =
            getCurrentUser();


        if (!user) {

            removeSession();


            window.location.href =
                "login.html";


            return;

        }


        let headers =
            getDatabaseHeaders();


        const response =

            await fetch(

                SUPABASE_URL +

                "/rest/v1/transactions" +

                "?user_id=eq." +

                encodeURIComponent(
                    user.id
                ) +

                "&select=*" +

                "&order=transaction_date.desc",

                {

                    method:
                        "GET",

                    headers:
                        headers

                }

            );


        // ========================================
        // JWT EXPIRED
        // ========================================

        if (
            response.status ===
            401
        ) {

            const refreshedSession =
                await refreshSession();


            if (
                !refreshedSession
            ) {

                removeSession();


                window.location.href =
                    "login.html";


                return;

            }


            headers =
                getDatabaseHeaders();


            return loadTransactions();

        }


        const text =
            await response.text();


        let transactions = [];


        if (text) {

            try {

                transactions =
                    JSON.parse(
                        text
                    );

            }

            catch (error) {

                throw new Error(
                    "Invalid response from database."
                );

            }

        }


        if (!response.ok) {

            throw new Error(

                transactions.message ||

                transactions.hint ||

                transactions.details ||

                "Could not load transactions."

            );

        }


        renderTransactions(
            transactions
        );


        updateSummary(
            transactions
        );

    }

    catch (error) {

        console.error(
            error
        );


        if (transactionList) {

            transactionList.innerHTML =
                "";

        }


        alert(

            "Error loading transactions: " +

            error.message

        );

    }

    finally {

        if (loadingElement) {

            loadingElement.style.display =
                "none";

        }

    }

}


// ========================================
// RENDER TRANSACTIONS
// ========================================

function renderTransactions(
    transactions
) {

    transactionList.innerHTML =
        "";


    if (
        !transactions ||
        transactions.length === 0
    ) {

        emptyMessageElement.style.display =
            "block";


        return;

    }


    emptyMessageElement.style.display =
        "none";


    transactions.forEach(

        function (transaction) {

            const row =
                document.createElement(
                    "tr"
                );


            const amount =
                Number(
                    transaction.amount
                );


            const amountClass =

                transaction.type ===
                "income"

                    ?

                    "income"

                    :

                    "expense";


            const amountSymbol =

                transaction.type ===
                "income"

                    ?

                    "+ "

                    :

                    "- ";


            row.innerHTML =

                "<td>" +

                escapeHTML(
                    transaction.description ||
                    ""
                ) +

                "</td>" +


                "<td>" +

                escapeHTML(
                    transaction.category ||
                    ""
                ) +

                "</td>" +


                "<td>" +

                escapeHTML(
                    transaction.type ||
                    ""
                ) +

                "</td>" +


                "<td>" +

                formatDate(
                    transaction.transaction_date
                ) +

                "</td>" +


                "<td class='" +

                amountClass +

                "'>" +

                amountSymbol +

                formatCurrency(
                    amount
                ) +

                "</td>" +


                "<td>" +

                "<button " +

                "class='delete-btn' " +

                "data-id='" +

                transaction.id +

                "'>" +

                "Delete" +

                "</button>" +

                "</td>";


            transactionList.appendChild(
                row
            );

        }

    );


    // ========================================
    // DELETE BUTTON EVENTS
    // ========================================

    const deleteButtons =

        document.querySelectorAll(
            ".delete-btn"
        );


    deleteButtons.forEach(

        function (button) {

            button.addEventListener(

                "click",

                async function () {

                    const transactionId =
                        button.dataset.id;


                    await deleteTransaction(
                        transactionId
                    );

                }

            );

        }

    );

}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary(
    transactions
) {

    let totalIncome =
        0;


    let totalExpense =
        0;


    transactions.forEach(

        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                );


            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    amount;

            }

            else if (
                transaction.type ===
                "expense"
            ) {

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
// DELETE TRANSACTION
// ========================================

async function deleteTransaction(
    transactionId
) {

    const confirmation =
        confirm(

            "Are you sure you want to delete this transaction?"

        );


    if (!confirmation) {

        return;

    }


    try {

        const validSession =
            await checkUserSession();


        if (!validSession) {

            return;

        }


        const user =
            getCurrentUser();


        const headers =
            getDatabaseHeaders();


        const response =

            await fetch(

                SUPABASE_URL +

                "/rest/v1/transactions" +

                "?id=eq." +

                encodeURIComponent(
                    transactionId
                ) +

                "&user_id=eq." +

                encodeURIComponent(
                    user.id
                ),

                {

                    method:
                        "DELETE",

                    headers:
                        headers

                }

            );


        if (
            response.status ===
            401
        ) {

            const refreshedSession =
                await refreshSession();


            if (!refreshedSession) {

                removeSession();


                window.location.href =
                    "auth.html";


                return;

            }


            return deleteTransaction(
                transactionId
            );

        }


        if (!response.ok) {

            const text =
                await response.text();


            let data = {};


            if (text) {

                try {

                    data =
                        JSON.parse(
                            text
                        );

                }

                catch (error) {

                    console.error(
                        text
                    );

                }

            }


            throw new Error(

                data.message ||

                data.hint ||

                data.details ||

                "Could not delete transaction."

            );

        }


        await loadTransactions();

    }

    catch (error) {

        alert(

            "Error deleting transaction: " +

            error.message

        );

    }

}


// ========================================
// REFRESH BUTTON
// ========================================

if (refreshBtn) {

    refreshBtn.addEventListener(

        "click",

        async function () {

            refreshBtn.disabled =
                true;


            refreshBtn.textContent =
                "Refreshing...";


            await loadTransactions();


            refreshBtn.disabled =
                false;


            refreshBtn.textContent =
                "Refresh";

        }

    );

}


// ========================================
// START APPLICATION
// ========================================

async function startApplication() {

    const validSession =
        await checkUserSession();


    if (!validSession) {

        return;

    }


    loadProfile();


    setTodayDate();


    await loadTransactions();

}


// ========================================
// RUN APPLICATION
// ========================================

startApplication();