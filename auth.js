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


        const loginBtn =
            document.getElementById(
                "loginBtn"
            );


        const signupBtn =
            document.getElementById(
                "signupBtn"
            );


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        const signupMessage =
            document.getElementById(
                "signupMessage"
            );



        /*
        ========================================
        CHECK EXISTING LOGIN
        ========================================
        */

        const {
            data: {
                session
            },
            error
        } =
            await supabase.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );
        }


        if (session) {

            window.location.replace(
                "index.html"
            );

            return;
        }



        /*
        ========================================
        LOGIN / SIGNUP SWITCH
        ========================================
        */

        const showSignupBtn =
            document.getElementById(
                "showSignupBtn"
            );


        if (showSignupBtn) {

            showSignupBtn.addEventListener(
                "click",
                () => {

                    loginSection
                        .classList
                        .add("hidden");


                    signupSection
                        .classList
                        .remove("hidden");


                    clearMessages();

                }
            );
        }



        const showLoginBtn =
            document.getElementById(
                "showLoginBtn"
            );


        if (showLoginBtn) {

            showLoginBtn.addEventListener(
                "click",
                () => {

                    signupSection
                        .classList
                        .add("hidden");


                    loginSection
                        .classList
                        .remove("hidden");


                    clearMessages();

                }
            );
        }



        /*
        ========================================
        PASSWORD EYE
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



        /*
        ========================================
        LOGIN BUTTON
        ========================================
        */

        loginBtn.addEventListener(
            "click",
            login
        );



        /*
        ========================================
        SIGNUP BUTTON
        ========================================
        */

        signupBtn.addEventListener(
            "click",
            signup
        );



        /*
        ========================================
        ENTER KEY - LOGIN
        ========================================
        */

        loginPassword.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    login();

                }

            }
        );



        /*
        ========================================
        ENTER KEY - SIGNUP
        ========================================
        */

        signupPassword.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    signup();

                }

            }
        );



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


                if (!data.session) {

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

                /*
                ========================================
                EMAIL VERIFICATION REDIRECT
                ========================================
                */

                const redirectUrl =
                    new URL(
                        "auth.html",
                        window.location.href
                    ).href;


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

                            emailRedirectTo:
                                redirectUrl,

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
                ========================================
                EMAIL VERIFICATION
                ========================================
                */

                if (!data.session) {

                    showMessage(
                        signupMessage,

                        "Account created successfully. Please check your email and click the verification link. After verification, return here and login.",

                        "success"
                    );


                    signupPassword.value =
                        "";

                    return;
                }



                /*
                ========================================
                EMAIL CONFIRMATION DISABLED
                ========================================
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
        PASSWORD EYE BUTTON
        ========================================
        
        Hidden:
        👁

        Visible:
        🙈

        Only ONE eye button is shown.
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

                console.warn(
                    "Password toggle elements not found:",
                    inputId,
                    buttonId
                );

                return;
            }


            /*
            Remove any existing button text
            and set the initial eye.
            */

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

                        /*
                        SHOW PASSWORD
                        */

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

                        /*
                        HIDE PASSWORD
                        */

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



            /*
            INVALID LOGIN
            */

            if (
                lower.includes(
                    "invalid login credentials"
                )
            ) {

                return (
                    "Incorrect email or password."
                );
            }



            /*
            EMAIL NOT CONFIRMED
            */

            if (
                lower.includes(
                    "email not confirmed"
                )
            ) {

                return (
                    "Please verify your email first, then login."
                );
            }



            /*
            USER ALREADY EXISTS
            */

            if (
                lower.includes(
                    "user already registered"
                )
            ) {

                return (
                    "This email is already registered. Please login."
                );
            }



            /*
            INVALID API KEY
            */

            if (
                lower.includes(
                    "invalid api key"
                )
            ) {

                return (
                    "Invalid Supabase API key. Check supabase.js."
                );
            }



            /*
            CONFIRMATION EMAIL ERROR
            */

            if (
                lower.includes(
                    "sending confirmation email"
                )
            ) {

                return (
                    "The account was not completed because Supabase could not send the confirmation email."
                );
            }



            /*
            RATE LIMIT
            */

            if (
                lower.includes(
                    "rate limit"
                )
            ) {

                return (
                    "Too many requests. Please wait and try again."
                );
            }



            /*
            DEFAULT ERROR
            */

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

            if (loginMessage) {

                loginMessage.textContent =
                    "";

                loginMessage.className =
                    "message";
            }


            if (signupMessage) {

                signupMessage.textContent =
                    "";

                signupMessage.className =
                    "message";
            }

        }

    }
);