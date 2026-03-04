const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getStorage = (key) => JSON.parse(localStorage.getItem(`mock_${key}`) || "[]");
const setStorage = (key, data) => localStorage.setItem(`mock_${key}`, JSON.stringify(data));

const createMockEntity = (entityName) => {
    return {
        list: async (sortBy = "", limit = 100) => {
            await delay(100);
            let data = getStorage(entityName);
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
            const data = getStorage(entityName);
            const newItem = { id: crypto.randomUUID(), created_date: new Date().toISOString(), ...payload };
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
            await delay(200);
            const user = localStorage.getItem("mock_current_user");
            if (user) return JSON.parse(user);
            return null; // Return null instead of auto-creating to require login
        },
        login: async (email, password) => {
            await delay(500);
            const users = getStorage("Users");
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                throw new Error("Invalid email or password");
            }
            // Create session
            const sessionUser = { id: user.id, email: user.email, full_name: user.full_name };
            localStorage.setItem("mock_current_user", JSON.stringify(sessionUser));
            return sessionUser;
        },
        signup: async (email, password, fullName) => {
            await delay(500);
            const users = getStorage("Users");
            if (users.find(u => u.email === email)) {
                throw new Error("User with this email already exists");
            }
            const newUser = { id: `user_${Date.now()}`, email, password, full_name: fullName };
            users.push(newUser);
            setStorage("Users", users);

            // Auto login after signup
            const sessionUser = { id: newUser.id, email: newUser.email, full_name: newUser.full_name };
            localStorage.setItem("mock_current_user", JSON.stringify(sessionUser));
            return sessionUser;
        },
        logout: () => {
            localStorage.removeItem("mock_current_user");
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
