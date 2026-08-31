/* ========================================
   EXPENSE TRACKER AUTH
======================================== */


/* ========================================
   SUPABASE CONFIGURATION
======================================== */

const SUPABASE_URL =
    "https://actlzyfblgmhytgyjhzf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_9GJxgJuQ6oEWz4VwXGqwgg_mmbGN0_G";


/* ========================================
   EXPENSE TRACKER PAGE
======================================== */

/*
   IMPORTANT:

   If your main Expense Tracker file is
   not index.html, change this filename.
*/

const EXPENSE_TRACKER_PAGE =
    "index.html";


/* ========================================
   SUPABASE CLIENT
======================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ========================================
   ELEMENTS
======================================== */

const loginSection =
    document.getElementById("loginSection");

const signupSection =
    document.getElementById("signupSection");

const verifySection =
    document.getElementById("verifySection");

const forgotSection =
    document.getElementById("forgotSection");


const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const forgotForm =
    document.getElementById("forgotForm");


const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");


const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const confirmPassword =
    document.getElementById("confirmPassword");


const forgotEmail =
    document.getElementById("forgotEmail");


const loginBtn =
    document.getElementById("loginBtn");

const signupBtn =
    document.getElementById("signupBtn");

const resetBtn =
    document.getElementById("resetBtn");


const verifyEmail =
    document.getElementById("verifyEmail");


const authMessage =
    document.getElementById("authMessage");


/* ========================================
   PASSWORD SHOW / HIDE
======================================== */

const passwordToggleButtons =
    document.querySelectorAll(
        ".password-toggle"
    );


passwordToggleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    button.getAttribute(
                        "data-target"
                    );

                const input =
                    document.getElementById(
                        target
                    );


                if (!input) {
                    return;
                }


                if (
                    input.type ===
                    "password"
                ) {

                    input.type =
                        "text";

                    button.textContent =
                        "🙈";

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type =
                        "password";

                    button.textContent =
                        "👁";

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }
);


/* ========================================
   SHOW MESSAGE
======================================== */

function showMessage(
    message,
    type = "info"
) {

    authMessage.textContent =
        message;

    authMessage.className =
        "auth-message " + type;

    authMessage.classList.remove(
        "hidden"
    );

}


/* ========================================
   HIDE MESSAGE
======================================== */

function hideMessage() {

    authMessage.textContent =
        "";

    authMessage.className =
        "auth-message hidden";

}


/* ========================================
   SHOW LOGIN
======================================== */

function showLogin() {

    loginSection.classList.remove(
        "hidden"
    );

    signupSection.classList.add(
        "hidden"
    );

    verifySection.classList.add(
        "hidden"
    );

    forgotSection.classList.add(
        "hidden"
    );

    hideMessage();

}


/* ========================================
   SHOW SIGNUP
======================================== */

function showSignup() {

    loginSection.classList.add(
        "hidden"
    );

    signupSection.classList.remove(
        "hidden"
    );

    verifySection.classList.add(
        "hidden"
    );

    forgotSection.classList.add(
        "hidden"
    );

    hideMessage();

}


/* ========================================
   SHOW FORGOT PASSWORD
======================================== */

function showForgotPassword() {

    loginSection.classList.add(
        "hidden"
    );

    signupSection.classList.add(
        "hidden"
    );

    verifySection.classList.add(
        "hidden"
    );

    forgotSection.classList.remove(
        "hidden"
    );

    hideMessage();

}


/* ========================================
   SHOW VERIFY EMAIL
======================================== */

function showVerifyEmail(
    email
) {

    loginSection.classList.add(
        "hidden"
    );

    signupSection.classList.add(
        "hidden"
    );

    forgotSection.classList.add(
        "hidden"
    );

    verifySection.classList.remove(
        "hidden"
    );


    verifyEmail.textContent =
        email;


    hideMessage();

}


/* ========================================
   PASSWORD MATCH
======================================== */

function checkPasswordMatch() {

    const matchElement =
        document.getElementById(
            "passwordMatch"
        );


    if (
        !matchElement ||
        !signupPassword ||
        !confirmPassword
    ) {
        return;
    }


    if (
        confirmPassword.value === ""
    ) {

        matchElement.textContent =
            "";

        matchElement.className =
            "password-match";

        return;

    }


    if (
        signupPassword.value ===
        confirmPassword.value
    ) {

        matchElement.textContent =
            "✓ Passwords match";

        matchElement.className =
            "password-match match";

    } else {

        matchElement.textContent =
            "✕ Passwords do not match";

        matchElement.className =
            "password-match no-match";

    }

}


/* ========================================
   PASSWORD INPUT
======================================== */

if (signupPassword) {

    signupPassword.addEventListener(
        "input",
        checkPasswordMatch
    );

}


if (confirmPassword) {

    confirmPassword.addEventListener(
        "input",
        checkPasswordMatch
    );

}


/* ========================================
   CREATE ACCOUNT
======================================== */

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage();


        const name =
            signupName.value.trim();


        const email =
            signupEmail.value
                .trim()
                .toLowerCase();


        const password =
            signupPassword.value;


        const confirm =
            confirmPassword.value;


        /* ------------------------------
           CHECK NAME
        ------------------------------ */

        if (!name) {

            showMessage(
                "Please enter your full name.",
                "error"
            );

            signupName.focus();

            return;

        }


        /* ------------------------------
           CHECK EMAIL
        ------------------------------ */

        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            signupEmail.focus();

            return;

        }


        /* ------------------------------
           CHECK PASSWORD
        ------------------------------ */

        if (
            password.length < 6
        ) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            signupPassword.focus();

            return;

        }


        /* ------------------------------
           CHECK PASSWORD MATCH
        ------------------------------ */

        if (
            password !== confirm
        ) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            confirmPassword.focus();

            return;

        }


        /* ------------------------------
           BUTTON
        ------------------------------ */

        signupBtn.disabled =
            true;

        signupBtn.textContent =
            "Creating Account...";


        try {

            /* --------------------------
               SUPABASE SIGNUP
            -------------------------- */

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email:
                        email,

                    password:
                        password,

                    options: {

                        data: {

                            full_name:
                                name

                        },

                        emailRedirectTo:
                            window.location.origin +
                            "/auth.html"

                    }

                });


            /* --------------------------
               ERROR
            -------------------------- */

            if (error) {

                console.error(
                    "Signup error:",
                    error
                );

                throw error;

            }


            /* --------------------------
               SHOW VERIFY PAGE
            -------------------------- */

            showVerifyEmail(
                email
            );


            /*
               Clear passwords from
               the browser form.
            */

            signupPassword.value =
                "";

            confirmPassword.value =
                "";


        }

        catch (error) {

            console.error(
                "Signup error:",
                error
            );


            let message =
                error.message ||
                "Unable to create account.";


            if (
                message
                    .toLowerCase()
                    .includes(
                        "already registered"
                    )
            ) {

                message =
                    "This email is already registered. Please login.";

            }


            if (
                message
                    .toLowerCase()
                    .includes(
                        "rate limit"
                    )
            ) {

                message =
                    "Too many email requests. Please wait and try again.";

            }


            showMessage(
                message,
                "error"
            );

        }

        finally {

            signupBtn.disabled =
                false;

            signupBtn.textContent =
                "Create Account";

        }

    }
);


/* ========================================
   LOGIN
======================================== */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage();


        const email =
            loginEmail.value
                .trim()
                .toLowerCase();


        const password =
            loginPassword.value;


        if (!email) {

            showMessage(
                "Please enter your email.",
                "error"
            );

            return;

        }


        if (!password) {

            showMessage(
                "Please enter your password.",
                "error"
            );

            return;

        }


        loginBtn.disabled =
            true;

        loginBtn.textContent =
            "Logging in...";


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {

                throw error;

            }


            const user =
                data.user;


            /* --------------------------
               CHECK EMAIL VERIFICATION
            -------------------------- */

            if (
                !user.email_confirmed_at
            ) {

                await supabaseClient
                    .auth
                    .signOut();


                showVerifyEmail(
                    email
                );


                showMessage(
                    "Please verify your email before logging in. Check your inbox and click the verification link.",
                    "error"
                );


                return;

            }


            /* --------------------------
               LOGIN SUCCESS
            -------------------------- */

            window.location.href =
                EXPENSE_TRACKER_PAGE;

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            let message =
                error.message ||
                "Login failed.";


            if (
                message
                    .toLowerCase()
                    .includes(
                        "invalid login credentials"
                    )
            ) {

                message =
                    "Incorrect email or password.";

            }


            showMessage(
                message,
                "error"
            );

        }

        finally {

            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Login";

        }

    }
);


/* ========================================
   RESEND VERIFICATION EMAIL
======================================== */

const resendVerificationBtn =
    document.getElementById(
        "resendVerificationBtn"
    );


resendVerificationBtn.addEventListener(
    "click",
    async function () {

        const email =
            verifyEmail.textContent.trim();


        if (!email) {

            showMessage(
                "Email address is missing.",
                "error"
            );

            return;

        }


        resendVerificationBtn.disabled =
            true;

        resendVerificationBtn.textContent =
            "Sending...";


        try {

            const {
                error
            } =
                await supabaseClient.auth.resend({

                    type:
                        "signup",

                    email:
                        email,

                    options: {

                        emailRedirectTo:
                            window.location.origin +
                            "/auth.html"

                    }

                });


            if (error) {

                throw error;

            }


            showMessage(
                "Verification email sent successfully. Please check your inbox.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Resend error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to resend verification email.",
                "error"
            );

        }

        finally {

            resendVerificationBtn.disabled =
                false;

            resendVerificationBtn.textContent =
                "Resend Verification Email";

        }

    }
);


/* ========================================
   RETURN TO EXPENSE TRACKER
======================================== */

const returnToTrackerBtn =
    document.getElementById(
        "returnToTrackerBtn"
    );


returnToTrackerBtn.addEventListener(
    "click",
    async function () {

        await supabaseClient
            .auth
            .signOut();


        showLogin();

    }
);


/* ========================================
   FORGOT PASSWORD
======================================== */

const forgotPasswordBtn =
    document.getElementById(
        "forgotPasswordBtn"
    );


forgotPasswordBtn.addEventListener(
    "click",
    function () {

        showForgotPassword();

    }
);


/* ========================================
   RESET PASSWORD
======================================== */

forgotForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage();


        const email =
            forgotEmail.value
                .trim()
                .toLowerCase();


        if (!email) {

            showMessage(
                "Please enter your email.",
                "error"
            );

            return;

        }


        resetBtn.disabled =
            true;

        resetBtn.textContent =
            "Sending...";


        try {

            const {
                error
            } =
                await supabaseClient.auth
                    .resetPasswordForEmail(
                        email,
                        {

                            redirectTo:
                                window.location.origin +
                                "/auth.html"

                        }
                    );


            if (error) {

                throw error;

            }


            showMessage(
                "Password reset link sent. Please check your email.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Reset error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to send password reset email.",
                "error"
            );

        }

        finally {

            resetBtn.disabled =
                false;

            resetBtn.textContent =
                "Send Reset Link";

        }

    }
);


/* ========================================
   NAVIGATION
======================================== */

document
    .getElementById("showSignupBtn")
    .addEventListener(
        "click",
        showSignup
    );


document
    .getElementById("showLoginBtn")
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById("backToLoginBtn")
    .addEventListener(
        "click",
        showLogin
    );


/* ========================================
   CHECK SESSION
======================================== */

async function checkCurrentSession() {

    try {

        const {
            data
        } =
            await supabaseClient
                .auth
                .getSession();


        const session =
            data.session;


        if (
            !session ||
            !session.user
        ) {

            return;

        }


        const user =
            session.user;


        /*
           If email is not verified,
           remove session.
        */

        if (
            !user.email_confirmed_at
        ) {

            await supabaseClient
                .auth
                .signOut();

            return;

        }


        /*
           Verified user.
           Go to Expense Tracker.
        */

        window.location.href =
            EXPENSE_TRACKER_PAGE;

    }

    catch (error) {

        console.error(
            "Session error:",
            error
        );

    }

}


/* ========================================
   AUTH STATE
======================================== */

supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        console.log(
            "Auth event:",
            event
        );

    }
);


/* ========================================
   START
======================================== */

checkCurrentSession();