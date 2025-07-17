// Authentication utilities and functions

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Get all users from storage
function getUsers() {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
}

// Save users to storage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Login user
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user (without password)
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    
    return { success: false, error: 'Invalid email or password' };
}

// Register user
function registerUser(name, email, password) {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'User with this email already exists' };
    }
    
    // Create new user
    const user = {
        id: generateId(),
        name: name,
        email: email,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    saveUsers(users);
    
    // Login the user automatically
    const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Update navigation based on authentication status
function updateNavigation() {
    const navUser = document.getElementById('navUser');
    const navGuest = document.getElementById('navGuest');
    const currentUserSpan = document.getElementById('currentUser');
    
    if (isAuthenticated()) {
        const user = getCurrentUser();
        if (navUser) {
            navUser.style.display = 'flex';
            if (currentUserSpan) {
                currentUserSpan.textContent = user.name;
            }
        }
        if (navGuest) {
            navGuest.style.display = 'none';
        }
    } else {
        if (navUser) {
            navUser.style.display = 'none';
        }
        if (navGuest) {
            navGuest.style.display = 'flex';
        }
    }
}

// Form validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.trim().length >= 2;
}

// Clear form errors
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// Show form message
function showFormMessage(message, type = 'error') {
    const messageEl = document.getElementById('formMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    clearFormErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    let hasErrors = false;
    
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        hasErrors = true;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        hasErrors = true;
    }
    
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Attempt login
    const result = loginUser(email, password);
    
    if (result.success) {
        showFormMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showFormMessage(result.error);
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    clearFormErrors();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    let hasErrors = false;
    
    if (!name) {
        document.getElementById('nameError').textContent = 'Name is required';
        hasErrors = true;
    } else if (!validateName(name)) {
        document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
        hasErrors = true;
    }
    
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        hasErrors = true;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        hasErrors = true;
    }
    
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        hasErrors = true;
    } else if (!validatePassword(password)) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
        hasErrors = true;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Attempt registration
    const result = registerUser(name, email, password);
    
    if (result.success) {
        showFormMessage('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showFormMessage(result.error);
    }
}
// finished