import { backend } from 'declarations/backend';

let balance = 0;

async function updateBalance() {
    balance = await backend.getBalance();
    document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
}

document.getElementById('placeBet').addEventListener('click', async () => {
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
    try {
        await backend.addFunds(100);
        await updateBalance();
        document.getElementById('result').textContent = 'Added $100 to your balance';
    } catch (error) {
        console.error('Error adding funds:', error);
        document.getElementById('result').textContent = 'Error adding funds. Please try again.';
    }
});

// Initial balance update
updateBalance();
