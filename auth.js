document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
        ========================================
        SUPABASE CLIENT
        ========================================
        */

        const supabase =
            window.supabaseClient;


        if (!supabase) {

            console.error(
                "Supabase client was not created."
            );

            return;
        }


        /*
        ========================================
        PRODUCTION AUTH URL
        ========================================
        */

        const AUTH_REDIRECT_URL =
            "https://muralikrishnan-4.github.io/Expense-Tracker/auth.html";


        /*
        ========================================
        ELEMENTS
        ========================================
        */

        const loginSection =
            document.getElementById(
                "loginSection"
            );

        const signupSection =
            document.getElementById(
                "signupSection"
            );

        const forgotSection =
            document.getElementById(
                "forgotSection"
            );

        const resetSection =
            document.getElementById(
                "resetSection"
            );


        const loginEmail =
            document.getElementById(
                "loginEmail"
            );

        const loginPassword =
            document.getElementById(
                "loginPassword"
            );


        const signupName =
            document.getElementById(
                "signupName"
            );

        const signupEmail =
            document.getElementById(
                "signupEmail"
            );

        const signupPassword =
            document.getElementById(
                "signupPassword"
            );


        const forgotEmail =
            document.getElementById(
                "forgotEmail"
            );


        const newPassword =
            document.getElementById(
                "newPassword"
            );

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        const loginBtn =
            document.getElementById(
                "loginBtn"
            );

        const signupBtn =
            document.getElementById(
                "signupBtn"
            );

        const sendResetBtn =
            document.getElementById(
                "sendResetBtn"
            );

        const updatePasswordBtn =
            document.getElementById(
                "updatePasswordBtn"
            );


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );

        const signupMessage =
            document.getElementById(
                "signupMessage"
            );

        const forgotMessage =
            document.getElementById(
                "forgotMessage"
            );

        const resetMessage =
            document.getElementById(
                "resetMessage"
            );


        /*
        ========================================
        VERIFICATION ELEMENTS
        ========================================
        */

        const verificationPanel =
            document.getElementById(
                "verificationPanel"
            );

        const verificationEmail =
            document.getElementById(
                "verificationEmail"
            );

        const resendVerificationBtn =
            document.getElementById(
                "resendVerificationBtn"
            );

        const resendVerificationMessage =
            document.getElementById(
                "resendVerificationMessage"
            );


        let pendingVerificationEmail =
            "";


        /*
        ========================================
        BUTTONS
        ========================================
        */

        const showSignupBtn =
            document.getElementById(
                "showSignupBtn"
            );

        const showLoginBtn =
            document.getElementById(
                "showLoginBtn"
            );

        const forgotPasswordBtn =
            document.getElementById(
                "forgotPasswordBtn"
            );

        const backToLoginBtn =
            document.getElementById(
                "backToLoginBtn"
            );


        /*
        ========================================
        CHECK PASSWORD RECOVERY
        ========================================
        */

        const currentUrl =
            window.location.href;


        const isRecoveryUrl =
            currentUrl.includes(
                "type=recovery"
            ) ||
            currentUrl.includes(
                "access_token="
            );


        /*
        ========================================
        AUTH STATE CHANGE
        ========================================
        */

        supabase.auth.onAuthStateChange(
            (event, session) => {

                console.log(
                    "Auth event:",
                    event
                );


                /*
                PASSWORD RECOVERY
                */

                if (
                    event ===
                    "PASSWORD_RECOVERY"
                ) {

                    showResetSection();

                }

            }
        );


        /*
        ========================================
        GET SESSION
        ========================================
        */

        try {

            const {
                data,
                error
            } =
                await supabase.auth.getSession();


            if (error) {

                console.error(
                    "Session error:",
                    error
                );

            }


            /*
            IMPORTANT:
            Do NOT redirect to dashboard
            during password recovery.
            */

            if (
                data?.session &&
                !isRecoveryUrl
            ) {

                window.location.replace(
                    "index.html"
                );

                return;

            }


            /*
            PASSWORD RESET LINK
            */

            if (isRecoveryUrl) {

                showResetSection();

            }

        } catch (error) {

            console.error(
                "Session check error:",
                error
            );

        }


        /*
        ========================================
        LOGIN / SIGNUP SWITCH
        ========================================
        */

        if (showSignupBtn) {

            showSignupBtn.addEventListener(
                "click",
                () => {

                    hideAllSections();

                    signupSection
                        .classList
                        .remove(
                            "hidden"
                        );

                    clearMessages();

                }
            );

        }


        if (showLoginBtn) {

            showLoginBtn.addEventListener(
                "click",
                showLoginSection
            );

        }


        /*
        ========================================
        FORGOT PASSWORD BUTTON
        ========================================
        */

        if (forgotPasswordBtn) {

            forgotPasswordBtn.addEventListener(
                "click",
                showForgotSection
            );

        }


        /*
        ========================================
        BACK TO LOGIN
        ========================================
        */

        if (backToLoginBtn) {

            backToLoginBtn.addEventListener(
                "click",
                showLoginSection
            );

        }


        /*
        ========================================
        PASSWORD EYE BUTTONS
        ========================================
        */

        setupPasswordToggle(
            "loginPassword",
            "loginPasswordToggle"
        );

        setupPasswordToggle(
            "signupPassword",
            "signupPasswordToggle"
        );

        setupPasswordToggle(
            "newPassword",
            "newPasswordToggle"
        );

        setupPasswordToggle(
            "confirmPassword",
            "confirmPasswordToggle"
        );


        /*
        ========================================
        LOGIN BUTTON
        ========================================
        */

        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                login
            );

        }


        /*
        ========================================
        SIGNUP BUTTON
        ========================================
        */

        if (signupBtn) {

            signupBtn.addEventListener(
                "click",
                signup
            );

        }


        /*
        ========================================
        SEND RESET BUTTON
        ========================================
        */

        if (sendResetBtn) {

            sendResetBtn.addEventListener(
                "click",
                sendResetEmail
            );

        }


        /*
        ========================================
        UPDATE PASSWORD BUTTON
        ========================================
        */

        if (updatePasswordBtn) {

            updatePasswordBtn.addEventListener(
                "click",
                updatePassword
            );

        }


        /*
        ========================================
        RESEND VERIFICATION
        ========================================
        */

        if (resendVerificationBtn) {

            resendVerificationBtn.addEventListener(
                "click",
                resendVerificationEmail
            );

        }


        /*
        ========================================
        ENTER KEY - LOGIN
        ========================================
        */

        if (loginPassword) {

            loginPassword.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        login();

                    }

                }
            );

        }


        /*
        ========================================
        ENTER KEY - SIGNUP
        ========================================
        */

        if (signupPassword) {

            signupPassword.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        signup();

                    }

                }
            );

        }


        /*
        ========================================
        ENTER KEY - FORGOT EMAIL
        ========================================
        */

        if (forgotEmail) {

            forgotEmail.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        sendResetEmail();

                    }

                }
            );

        }


        /*
        ========================================
        ENTER KEY - RESET PASSWORD
        ========================================
        */

        if (confirmPassword) {

            confirmPassword.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        updatePassword();

                    }

                }
            );

        }


        /*
        ========================================
        LOGIN
        ========================================
        */

        async function login() {

            clearMessages();


            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if (!email) {

                showMessage(
                    loginMessage,
                    "Please enter your email.",
                    "error"
                );

                return;
            }


            if (!password) {

                showMessage(
                    loginMessage,
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
                    await supabase.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (error) {

                    throw error;

                }


                if (!data?.session) {

                    throw new Error(
                        "Login session was not created."
                    );

                }


                showMessage(
                    loginMessage,
                    "Login successful.",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.replace(
                            "index.html"
                        );

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    loginMessage,
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                loginBtn.disabled =
                    false;

                loginBtn.textContent =
                    "Login";

            }

        }


        /*
        ========================================
        CREATE ACCOUNT
        ========================================
        */

        async function signup() {

            clearMessages();


            if (verificationPanel) {

                verificationPanel.classList.add(
                    "hidden"
                );

            }


            const name =
                signupName.value.trim();

            const email =
                signupEmail.value.trim();

            const password =
                signupPassword.value;


            if (!name) {

                showMessage(
                    signupMessage,
                    "Please enter your full name.",
                    "error"
                );

                return;

            }


            if (!email) {

                showMessage(
                    signupMessage,
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    signupMessage,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;

            }


            signupBtn.disabled =
                true;

            signupBtn.textContent =
                "Creating Account...";


            try {

                const {
                    data,
                    error
                } =
                    await supabase.auth.signUp({

                        email:
                            email,

                        password:
                            password,

                        options: {

                            /*
                            ALWAYS use GitHub Pages
                            for email verification.
                            */

                            emailRedirectTo:
                                AUTH_REDIRECT_URL,

                            data: {

                                full_name:
                                    name

                            }

                        }

                    });


                if (error) {

                    throw error;

                }


                /*
                ====================================
                EMAIL VERIFICATION REQUIRED
                ====================================
                */

                if (!data?.session) {

                    pendingVerificationEmail =
                        email;


                    if (verificationEmail) {

                        verificationEmail.textContent =
                            email;

                    }


                    if (verificationPanel) {

                        verificationPanel.classList.remove(
                            "hidden"
                        );

                    }


                    signupPassword.value =
                        "";


                    showMessage(
                        signupMessage,

                        "Account created successfully. Please check your email and click the verification link.",

                        "success"
                    );


                    return;

                }


                /*
                ====================================
                EMAIL CONFIRMATION DISABLED
                ====================================
                */

                showMessage(
                    signupMessage,

                    "Account created successfully. Opening Expense Tracker...",

                    "success"
                );


                setTimeout(
                    () => {

                        window.location.replace(
                            "index.html"
                        );

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                showMessage(
                    signupMessage,
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                signupBtn.disabled =
                    false;

                signupBtn.textContent =
                    "Create Account";

            }

        }


        /*
        ========================================
        FORGOT PASSWORD
        ========================================
        */

        function showForgotSection() {

            hideAllSections();

            clearMessages();


            if (forgotSection) {

                forgotSection.classList.remove(
                    "hidden"
                );

            }


            /*
            Automatically copy login email
            */

            if (
                loginEmail &&
                forgotEmail
            ) {

                forgotEmail.value =
                    loginEmail.value.trim();

            }


            if (forgotEmail) {

                forgotEmail.focus();

            }

        }


        /*
        ========================================
        SEND PASSWORD RESET EMAIL
        ========================================
        */

        async function sendResetEmail() {

            clearMessages();


            const email =
                forgotEmail.value.trim();


            if (!email) {

                showMessage(
                    forgotMessage,
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            sendResetBtn.disabled =
                true;

            sendResetBtn.textContent =
                "Sending...";


            try {

                /*
                IMPORTANT:
                NEVER use localhost here.

                Always redirect to the live
                GitHub Pages website.
                */

                const {
                    error
                } =
                    await supabase.auth
                        .resetPasswordForEmail(

                            email,

                            {

                                redirectTo:
                                    AUTH_REDIRECT_URL

                            }

                        );


                if (error) {

                    throw error;

                }


                showMessage(

                    forgotMessage,

                    "If an account exists with this email, a password reset link has been sent. Check your inbox and spam folder.",

                    "success"

                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                showMessage(
                    forgotMessage,
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                sendResetBtn.disabled =
                    false;

                sendResetBtn.textContent =
                    "Send Reset Link";

            }

        }


        /*
        ========================================
        SHOW RESET PASSWORD
        ========================================
        */

        function showResetSection() {

            hideAllSections();

            clearMessages();


            if (resetSection) {

                resetSection.classList.remove(
                    "hidden"
                );

            }


            if (newPassword) {

                setTimeout(
                    () => {

                        newPassword.focus();

                    },
                    100
                );

            }

        }


        /*
        ========================================
        UPDATE PASSWORD
        ========================================
        */

        async function updatePassword() {

            clearMessages();


            const password =
                newPassword.value;

            const confirm =
                confirmPassword.value;


            if (!password) {

                showMessage(
                    resetMessage,
                    "Please enter a new password.",
                    "error"
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    resetMessage,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;

            }


            if (password !== confirm) {

                showMessage(
                    resetMessage,
                    "Passwords do not match.",
                    "error"
                );

                return;

            }


            updatePasswordBtn.disabled =
                true;

            updatePasswordBtn.textContent =
                "Updating...";


            try {

                const {
                    error
                } =
                    await supabase.auth
                        .updateUser({

                            password:
                                password

                        });


                if (error) {

                    throw error;

                }


                showMessage(

                    resetMessage,

                    "Password updated successfully. Opening Expense Tracker...",

                    "success"

                );


                newPassword.value =
                    "";

                confirmPassword.value =
                    "";


                setTimeout(
                    () => {

                        window.location.replace(
                            "index.html"
                        );

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Update password error:",
                    error
                );


                showMessage(
                    resetMessage,
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                updatePasswordBtn.disabled =
                    false;

                updatePasswordBtn.textContent =
                    "Update Password";

            }

        }


        /*
        ========================================
        RESEND VERIFICATION EMAIL
        ========================================
        */

        async function resendVerificationEmail() {

            const email =
                pendingVerificationEmail ||
                signupEmail.value.trim();


            if (!email) {

                showMessage(
                    resendVerificationMessage,
                    "Please enter your email.",
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
                    await supabase.auth.resend({

                        type:
                            "signup",

                        email:
                            email,

                        options: {

                            emailRedirectTo:
                                AUTH_REDIRECT_URL

                        }

                    });


                if (error) {

                    throw error;

                }


                showMessage(

                    resendVerificationMessage,

                    "Verification email sent. Check your inbox and spam folder.",

                    "success"

                );


            } catch (error) {

                console.error(
                    "Resend verification error:",
                    error
                );


                showMessage(
                    resendVerificationMessage,
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                resendVerificationBtn.disabled =
                    false;

                resendVerificationBtn.textContent =
                    "Resend verification email";

            }

        }


        /*
        ========================================
        SHOW LOGIN
        ========================================
        */

        function showLoginSection() {

            hideAllSections();

            clearMessages();


            if (loginSection) {

                loginSection.classList.remove(
                    "hidden"
                );

            }

        }


        /*
        ========================================
        HIDE ALL SECTIONS
        ========================================
        */

        function hideAllSections() {

            if (loginSection) {

                loginSection.classList.add(
                    "hidden"
                );

            }


            if (signupSection) {

                signupSection.classList.add(
                    "hidden"
                );

            }


            if (forgotSection) {

                forgotSection.classList.add(
                    "hidden"
                );

            }


            if (resetSection) {

                resetSection.classList.add(
                    "hidden"
                );

            }

        }


        /*
        ========================================
        PASSWORD EYE
        ========================================
        */

        function setupPasswordToggle(
            inputId,
            buttonId
        ) {

            const input =
                document.getElementById(
                    inputId
                );

            const button =
                document.getElementById(
                    buttonId
                );


            if (!input || !button) {

                return;

            }


            button.textContent =
                "👁";


            button.setAttribute(
                "aria-label",
                "Show password"
            );


            button.setAttribute(
                "title",
                "Show password"
            );


            button.addEventListener(
                "click",
                () => {

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

                        button.setAttribute(
                            "title",
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

                        button.setAttribute(
                            "title",
                            "Show password"
                        );

                    }

                }
            );

        }


        /*
        ========================================
        ERROR HANDLING
        ========================================
        */

        function getErrorMessage(
            error
        ) {

            const message =
                String(
                    error?.message || ""
                );


            const lower =
                message.toLowerCase();


            if (
                lower.includes(
                    "invalid login credentials"
                )
            ) {

                return (
                    "Incorrect email or password."
                );

            }


            if (
                lower.includes(
                    "email not confirmed"
                )
            ) {

                return (
                    "Please verify your email first, then login."
                );

            }


            if (
                lower.includes(
                    "user already registered"
                )
            ) {

                return (
                    "This email is already registered. Please login or verify your email."
                );

            }


            if (
                lower.includes(
                    "invalid api key"
                )
            ) {

                return (
                    "Invalid Supabase API key. Check supabase.js."
                );

            }


            if (
                lower.includes(
                    "sending confirmation email"
                )
            ) {

                return (
                    "The account was not completed because Supabase could not send the confirmation email."
                );

            }


            if (
                lower.includes(
                    "rate limit"
                )
            ) {

                return (
                    "Too many requests. Please wait and try again."
                );

            }


            if (
                lower.includes(
                    "password recovery"
                )
            ) {

                return (
                    "This password reset link is invalid or has expired. Please request a new one."
                );

            }


            if (
                lower.includes(
                    "expired"
                )
            ) {

                return (
                    "This link has expired. Please request a new password reset link."
                );

            }


            return (
                message ||
                "Something went wrong. Please try again."
            );

        }


        /*
        ========================================
        SHOW MESSAGE
        ========================================
        */

        function showMessage(
            element,
            text,
            type
        ) {

            if (!element) {

                return;

            }


            element.textContent =
                text;


            element.className =
                `message ${type}`;

        }


        /*
        ========================================
        CLEAR MESSAGES
        ========================================
        */

        function clearMessages() {

            const messages = [

                loginMessage,

                signupMessage,

                forgotMessage,

                resetMessage,

                resendVerificationMessage

            ];


            messages.forEach(
                element => {

                    if (!element) {

                        return;

                    }


                    element.textContent =
                        "";

                    element.className =
                        "message";

                }
            );

        }

    }
);