import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

let authClient;
let userPrincipal = null;
let balance = 0;

async function initAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    }
}

async function login() {
    const days = BigInt(1);
    const hours = BigInt(24);
    const nanoseconds = BigInt(3600000000000);
    
    authClient.login({
        identityProvider: process.env.DFX_NETWORK === "ic" 
            ? "https://identity.ic0.app"
            : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
        onSuccess: handleAuthenticated,
        maxTimeToLive: days * hours * nanoseconds,
    });
}

async function logout() {
    await authClient.logout();
    userPrincipal = null;
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'none';
}

async function handleAuthenticated() {
    const identity = await authClient.getIdentity();
    userPrincipal = identity.getPrincipal();
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'block';
    await updateBalance();
}

async function updateBalance() {
    if (!userPrincipal) return;
    balance = await backend.getBalance(userPrincipal);
    document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
}

document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('logoutButton').addEventListener('click', logout);

document.getElementById('placeBet').addEventListener('click', async () => {
    if (!userPrincipal) {
        alert('Please login first');
        return;
    }

    const betAmount = parseFloat(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Please enter a valid bet amount');
        return;
    }

    try {
        const result = await backend.placeBet(betAmount);
        document.getElementById('result').textContent = result;
        await updateBalance();
    } catch (error) {
        console.error('Error placing bet:', error);
        document.getElementById('result').textContent = 'Error placing bet. Please try again.';
    }
});

document.getElementById('addFunds').addEventListener('click', async () => {
    if (!userPrincipal) {
        alert('Please login first');
        return;
    }

    try {
        await backend.addFunds(100);
        await updateBalance();
        document.getElementById('result').textContent = 'Added $100 to your balance';
    } catch (error) {
        console.error('Error adding funds:', error);
        document.getElementById('result').textContent = 'Error adding funds. Please try again.';
    }
});

// Initialize authentication
initAuth();
