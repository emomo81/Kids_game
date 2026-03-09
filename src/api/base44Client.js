const delay = (ms) => new Promise(res => setTimeout(res, ms));

const createRealEntity = (entityName) => {
    const baseUrl = `http://localhost:5000/api/entities/${entityName}`;
    return {
        list: async (sortBy = "", limit = 100) => {
            const query = new URLSearchParams();
            if (sortBy) query.append('sortBy', sortBy);
            if (limit) query.append('limit', limit);
            const res = await fetch(`${baseUrl}?${query.toString()}`, { credentials: "include" });
            if (!res.ok) throw new Error(`Failed to list ${entityName}`);
            return res.json();
        },
        filter: async (queryObj) => {
            const res = await fetch(`${baseUrl}/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(queryObj),
                credentials: "include"
            });
            if (!res.ok) throw new Error(`Failed to filter ${entityName}`);
            return res.json();
        },
        create: async (payload) => {
            const res = await fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (!res.ok) throw new Error(`Failed to create ${entityName}`);
            return res.json();
        },
        update: async (id, payload) => {
            const res = await fetch(`${baseUrl}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (!res.ok) throw new Error(`Failed to update ${entityName}`);
            return res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${baseUrl}/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error(`Failed to delete ${entityName}`);
            return res.json();
        }
    };
};

export const base44 = {
    auth: {
        me: async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    credentials: "include"
                });
                if (!res.ok) {
                    return null;
                }
                const data = await res.json();
                return data.user;
            } catch (err) {
                console.error("Auth me error:", err);
                return null;
            }
        },
        login: async (email, password) => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to login");
                }
                return data.user;
            } catch (err) {
                throw err;
            }
        },
        signup: async (email, password, fullName) => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, fullName }),
                    credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to signup");
                }
                return data.user;
            } catch (err) {
                throw err;
            }
        },
        logout: async () => {
            try {
                await fetch("http://localhost:5000/api/auth/logout", {
                    method: "POST",
                    credentials: "include"
                });
            } catch (err) {
                console.error("Logout fetch error", err);
            }
            window.location.reload();
        },
        redirectToLogin: () => {
            console.log("Mock redirect to login");
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                await delay(500);
                const url = URL.createObjectURL(file);
                return { file_url: url };
            }
        }
    },
    entities: {
        PlayerProgress: createRealEntity("PlayerProgress"),
        LeaderboardEntry: createRealEntity("LeaderboardEntry"),
        Encouragement: createRealEntity("Encouragement"),
        Friendship: createRealEntity("Friendship"),
        FriendChallenge: createRealEntity("FriendChallenge"),
        Duel: createRealEntity("Duel"),
        DailyChallenge: createRealEntity("DailyChallenge"),
    }
};
