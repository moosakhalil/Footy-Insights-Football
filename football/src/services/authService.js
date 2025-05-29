import database from '../data/database.json';

// Simulate API calls with localStorage
const STORAGE_KEY = 'football_store_data';

// Initialize localStorage with database data if not exists
if (!localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

const getData = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const authService = {
  login: (email, password) => {
    const data = getData();
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  register: (userData) => {
    const data = getData();
    if (data.users.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser = {
      id: data.users.length + 1,
      ...userData,
      savedCards: [],
      billingAddress: null
    };
    
    data.users.push(newUser);
    saveData(data);
    return { success: true, user: newUser };
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    return { success: true };
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  updateUser: (userId, updates) => {
    const data = getData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates
    };
    saveData(data);
    localStorage.setItem('currentUser', JSON.stringify(data.users[userIndex]));
    return { success: true, user: data.users[userIndex] };
  },

  changePassword: (userId, oldPassword, newPassword) => {
    const data = getData();
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (user.password !== oldPassword) {
      return { success: false, error: 'Invalid old password' };
    }

    user.password = newPassword;
    saveData(data);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true };
  },

  saveCard: (userId, cardData) => {
    const data = getData();
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const newCard = {
      id: user.savedCards.length + 1,
      ...cardData
    };
    user.savedCards.push(newCard);
    saveData(data);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, card: newCard };
  },

  updateBillingAddress: (userId, addressData) => {
    const data = getData();
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.billingAddress = addressData;
    saveData(data);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, address: addressData };
  }
}; 