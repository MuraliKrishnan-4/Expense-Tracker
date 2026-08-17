// ========================================
// GET ELEMENTS
// ========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const signupForm =
    document.getElementById(
        "signupForm"
    );


const loginBox =
    document.getElementById(
        "loginBox"
    );


const signupBox =
    document.getElementById(
        "signupBox"
    );


const showSignup =
    document.getElementById(
        "showSignup"
    );


const showLogin =
    document.getElementById(
        "showLogin"
    );


// ========================================
// SWITCH TO SIGNUP
// ========================================

if (showSignup) {

    showSignup.addEventListener(

        "click",

        function (event) {

            event.preventDefault();


            loginBox.classList.add(
                "hidden"
            );


            signupBox.classList.remove(
                "hidden"
            );

        }

    );

}


// ========================================
// SWITCH TO LOGIN
// ========================================

if (showLogin) {

    showLogin.addEventListener(

        "click",

        function (event) {

            event.preventDefault();


            signupBox.classList.add(
                "hidden"
            );


            loginBox.classList.remove(
                "hidden"
            );

        }

    );

}


// ========================================
// LOGIN
// ========================================

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            const email =

                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim();


            const password =

                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const button =

                loginForm.querySelector(
                    "button"
                );


            button.disabled =
                true;


            button.textContent =
                "Logging in...";


            try {

                const response =

                    await fetch(

                        SUPABASE_URL +
                        "/auth/v1/token?grant_type=password",

                        {

                            method:
                                "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }

                    );


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

                        throw new Error(
                            "Invalid response from server."
                        );

                    }

                }


                if (!response.ok) {

                    throw new Error(

                        data.error_description ||

                        data.msg ||

                        data.message ||

                        "Login failed"

                    );

                }


                saveSession(
                    data
                );


                window.location.href =
                    "index.html";

            }

            catch (error) {

                alert(

                    "Login failed: " +

                    error.message

                );

            }

            finally {

                button.disabled =
                    false;


                button.textContent =
                    "Login";

            }

        }

    );

}


// ========================================
// SIGNUP
// ========================================

if (signupForm) {

    signupForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            const name =

                document
                    .getElementById(
                        "signupName"
                    )
                    .value
                    .trim();


            const email =

                document
                    .getElementById(
                        "signupEmail"
                    )
                    .value
                    .trim();


            const password =

                document
                    .getElementById(
                        "signupPassword"
                    )
                    .value;


            const button =

                signupForm.querySelector(
                    "button"
                );


            button.disabled =
                true;


            button.textContent =
                "Creating Account...";


            try {

                const response =

                    await fetch(

                        SUPABASE_URL +
                        "/auth/v1/signup",

                        {

                            method:
                                "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password,

                                    data: {

                                        full_name:
                                            name

                                    }

                                })

                        }

                    );


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

                        throw new Error(
                            "Invalid response from server."
                        );

                    }

                }


                if (!response.ok) {

                    throw new Error(

                        data.message ||

                        data.msg ||

                        data.error_description ||

                        "Signup failed"

                    );

                }


                alert(

                    "Account created successfully. Please login."

                );


                signupForm.reset();


                signupBox.classList.add(
                    "hidden"
                );


                loginBox.classList.remove(
                    "hidden"
                );


                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value =
                    email;

            }

            catch (error) {

                alert(

                    "Signup failed: " +

                    error.message

                );

            }

            finally {

                button.disabled =
                    false;


                button.textContent =
                    "Create Account";

            }

        }

    );

}


// ========================================
// CHECK EXISTING LOGIN
// ========================================

async function checkExistingLogin() {

    const session =
        getSession();


    if (!session) {

        return;

    }


    if (
        !session.access_token
    ) {

        removeSession();

        return;

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

            return;

        }

    }


    window.location.href =
        "index.html";

}


// ========================================
// RUN EXISTING LOGIN CHECK
// ========================================

checkExistingLogin();