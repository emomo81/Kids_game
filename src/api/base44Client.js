const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getStorage = (key) => JSON.parse(localStorage.getItem(`mock_${key}`) || "[]");
const setStorage = (key, data) => localStorage.setItem(`mock_${key}`, JSON.stringify(data));
const getCurrentUserId = () => {
    const user = localStorage.getItem("mock_current_user");
    return user ? JSON.parse(user).id : null;
};

const createMockEntity = (entityName) => {
    return {
        list: async (sortBy = "", limit = 100) => {
            await delay(100);
            const userId = getCurrentUserId();
            let data = getStorage(entityName);

            // Exempt global tables from strict user filtering
            const globalEntities = ["LeaderboardEntry", "DailyChallenge"];

            if (userId && !globalEntities.includes(entityName)) {
                // Scope to current user for privacy
                data = data.filter(item => item.user_id === userId || item.role === 'global');
            }
            if (sortBy) {
                let field = sortBy.startsWith("-") ? sortBy.slice(1) : sortBy;
                let desc = sortBy.startsWith("-");
                data.sort((a, b) => {
                    if (a[field] < b[field]) return desc ? 1 : -1;
                    if (a[field] > b[field]) return desc ? -1 : 1;
                    return 0;
                });
            }
            return data.slice(0, limit);
        },
        filter: async (query) => {
            await delay(100);
            let data = getStorage(entityName);
            return data.filter(item => {
                for (const key in query) {
                    if (item[key] !== query[key]) return false;
                }
                return true;
            });
        },
        create: async (payload) => {
            await delay(200);
            const userId = getCurrentUserId();
            const data = getStorage(entityName);
            const newItem = {
                id: crypto.randomUUID(),
                created_date: new Date().toISOString(),
                user_id: userId,
                ...payload
            };
            data.push(newItem);
            setStorage(entityName, data);
            return newItem;
        },
        update: async (id, payload) => {
            await delay(200);
            let data = getStorage(entityName);
            let index = data.findIndex(item => item.id === id);
            if (index >= 0) {
                data[index] = { ...data[index], ...payload, updated_date: new Date().toISOString() };
                setStorage(entityName, data);
                return data[index];
            }
            throw new Error(`Item ${id} not found in ${entityName}`);
        },
        delete: async (id) => {
            await delay(200);
            let data = getStorage(entityName);
            data = data.filter(item => item.id !== id);
            setStorage(entityName, data);
            return { success: true };
        }
    };
};

export const base44 = {
    auth: {
        me: async () => {
            const token = localStorage.getItem("token");
            if (!token) return null;
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    localStorage.removeItem("token");
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
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to login");
                }
                localStorage.setItem("token", data.token);
                return data.user;
            } catch (err) {
                // Return the error so UI can display it without logging a confusing red error in the console.
                throw err;
            }
        },
        signup: async (email, password, fullName) => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, fullName })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to signup");
                }
                localStorage.setItem("token", data.token);
                return data.user;
            } catch (err) {
                // Return the error so UI can display it
                throw err;
            }
        },
        logout: () => {
            localStorage.removeItem("token");
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
                // Create an object URL for local blob pretending to be an uploaded file
                const url = URL.createObjectURL(file);
                return { file_url: url };
            }
        }
    },
    entities: {
        PlayerProgress: createMockEntity("PlayerProgress"),
        LeaderboardEntry: createMockEntity("LeaderboardEntry"),
        Encouragement: createMockEntity("Encouragement"),
        Friendship: createMockEntity("Friendship"),
        FriendChallenge: createMockEntity("FriendChallenge"),
        Duel: createMockEntity("Duel"),
        DailyChallenge: createMockEntity("DailyChallenge"),
    }
};
