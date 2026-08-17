// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://actlzyfblgmhytgyjhzf.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_9GJxgJuQ6oEWz4VwXGqwgg_mmbGN0_G";


// ========================================
// SESSION STORAGE KEY
// ========================================

const SESSION_KEY =
    "expense_tracker_session";


// ========================================
// SAVE SESSION
// ========================================

function saveSession(session) {

    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

}


// ========================================
// GET SESSION
// ========================================

function getSession() {

    const session =
        localStorage.getItem(
            SESSION_KEY
        );


    if (!session) {

        return null;

    }


    try {

        return JSON.parse(
            session
        );

    }

    catch (error) {

        removeSession();

        return null;

    }

}


// ========================================
// REMOVE SESSION
// ========================================

function removeSession() {

    localStorage.removeItem(
        SESSION_KEY
    );

}


// ========================================
// GET CURRENT USER
// ========================================

function getCurrentUser() {

    const session =
        getSession();


    if (!session) {

        return null;

    }


    return session.user || null;

}


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders() {

    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY

    };

}


// ========================================
// DATABASE HEADERS
// ========================================

function getDatabaseHeaders() {

    const session =
        getSession();


    if (
        !session ||
        !session.access_token
    ) {

        return null;

    }


    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            "Bearer " +
            session.access_token

    };

}


// ========================================
// REFRESH SESSION
// ========================================

async function refreshSession() {

    const session =
        getSession();


    if (
        !session ||
        !session.refresh_token
    ) {

        return null;

    }


    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/auth/v1/token?grant_type=refresh_token",

                {

                    method:
                        "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            refresh_token:
                                session.refresh_token

                        })

                }

            );


        const text =
            await response.text();


        let data = {};


        if (text) {

            try {

                data =
                    JSON.parse(text);

            }

            catch (error) {

                console.error(
                    "Invalid refresh response"
                );

                return null;

            }

        }


        if (!response.ok) {

            console.error(
                data
            );

            removeSession();

            return null;

        }


        saveSession(
            data
        );


        return data;

    }

    catch (error) {

        console.error(
            "Session refresh error:",
            error
        );


        return null;

    }

}


// ========================================
// CHECK IF SESSION IS EXPIRED
// ========================================

function isSessionExpired() {

    const session =
        getSession();


    if (
        !session ||
        !session.expires_at
    ) {

        return true;

    }


    const currentTime =
        Math.floor(
            Date.now() / 1000
        );


    return currentTime >=
        session.expires_at;

}