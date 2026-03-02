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

            // Auto-create a mock user so the app behaves like you are signed in
            const dummyUser = { email: "player@example.com", full_name: "Player 1", id: "user_1" };
            localStorage.setItem("mock_current_user", JSON.stringify(dummyUser));
            return dummyUser;
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
