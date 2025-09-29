// Konfigurasi Contract
const CONTRACT_ADDRESS = "0xC1465Fdf616F63ba0dFA565Ce918f13feed2b468"; // Ganti dengan alamat contract yang sudah di-deploy
const CONTRACT_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"Claimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"ReferralReward","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"CLAIM","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_referralCode","type":"string"}],"name":"DEPOSIT","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"WITHDRAW","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getDownlineCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getDownlineList","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getLevelIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewardStaking","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getReferralCode","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTotalInvest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"isRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minWithdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];

// Global Variables
let provider;
let signer;
let contract;
let userAddress;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
}

// Fungsi Utama
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showAlert('Please install MetaMask first!', 'error');
            return;
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];

        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        connectWalletBtn.innerHTML = '<i class="fas fa-check"></i> Connected';
        connectWalletBtn.disabled = true;

        await checkUserStatus();
        await loadUserData();

        // Update navigation to show authenticated sections
        document.querySelector('.nav-links').innerHTML += `
            <li><a href="#withdraw"><i class="fas fa-wallet"></i> Withdraw</a></li>
        `;
        setupNavigation();

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                location.reload();
            } else {
                location.reload();
            }
        });

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showAlert('Failed to connect wallet: ' + error.message, 'error');
    }
}

async function checkUserStatus() {
    try {
        const isRegistered = await contract.isRegistered(userAddress);
        const walletInfo = document.getElementById('walletInfo');
        walletInfo.style.display = 'block';
        
        document.getElementById('walletAddress').textContent = 
            `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        
        if (isRegistered) {
            document.getElementById('registrationStatus').textContent = 'Registered';
            document.getElementById('registrationStatus').style.color = '#10b981';
            
            const referralCode = await contract.getReferralCode(userAddress);
            document.getElementById('userReferralCode').textContent = referralCode;
            document.getElementById('referralSection').style.display = 'block';
            
        } else {
            document.getElementById('registrationStatus').textContent = 'Not Registered';
            document.getElementById('registrationStatus').style.color = '#f59e0b';
        }
        
    } catch (error) {
        console.error('Error checking user status:', error);
    }
}

async function loadUserData() {
    try {
        // Load investment data
        const totalInvest = await contract.getTotalInvest(userAddress);
        document.getElementById('totalInvest').textContent = 
            ethers.utils.formatEther(totalInvest) + ' BNB';

        // Load reward data
        const pendingReward = await contract.getPendingReward(userAddress);
        document.getElementById('pendingReward').textContent = 
            ethers.utils.formatEther(pendingReward) + ' BNB';

        const pendingStaking = await contract.getPendingRewardStaking(userAddress);
        document.getElementById('pendingStaking').textContent = 
            ethers.utils.formatEther(pendingStaking) + ' BNB';

        // Calculate referral reward
        const referralReward = pendingReward.sub(pendingStaking);
        document.getElementById('pendingReferral').textContent = 
            ethers.utils.formatEther(referralReward) + ' BNB';

        // Update total balance
        const totalBalance = parseFloat(ethers.utils.formatEther(totalInvest)) + 
                           parseFloat(ethers.utils.formatEther(pendingReward));
        document.getElementById('totalBalance').textContent = 
            totalBalance.toFixed(4) + ' BNB';

        // Update withdraw section
        document.getElementById('totalPendingReward').textContent = 
            ethers.utils.formatEther(pendingReward) + ' BNB';
        document.getElementById('availableReward').textContent = 
            ethers.utils.formatEther(pendingReward) + ' BNB';

        // Load referral data if registered
        const isRegistered = await contract.isRegistered(userAddress);
        if (isRegistered) {
            await loadReferralData();
        }

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadReferralData() {
    try {
        for (let i = 1; i <= 5; i++) {
            const levelIncome = await contract.getLevelIncome(userAddress, i);
            document.getElementById(`level${i}Income`).textContent = 
                ethers.utils.formatEther(levelIncome) + ' BNB';

            const downlineCount = await contract.getDownlineCount(userAddress, i);
            document.getElementById(`level${i}Count`).textContent = downlineCount;
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

async function deposit() {
    try {
        const depositAmount = document.getElementById('depositAmount').value;
        const referralCode = document.getElementById('referralCodeInput').value;

        if (!depositAmount || parseFloat(depositAmount) < 0.01) {
            showAlert('Minimum deposit is 0.01 BNB', 'error');
            return;
        }

        const amountInWei = ethers.utils.parseEther(depositAmount);
        
        const depositBtn = document.getElementById('depositBtn');
        const originalText = depositBtn.innerHTML;
        depositBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        depositBtn.disabled = true;

        const depositStatus = document.getElementById('depositStatus');
        depositStatus.style.display = 'block';
        depositStatus.className = 'alert alert-info';
        depositStatus.innerHTML = '<i class="fas fa-info-circle"></i> Sending transaction...';

        const tx = await contract.DEPOSIT(referralCode, { value: amountInWei });
        
        depositStatus.innerHTML = `<i class="fas fa-info-circle"></i> Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        
        await tx.wait();
        
        depositStatus.className = 'alert alert-success';
        depositStatus.innerHTML = '<i class="fas fa-check-circle"></i> Deposit successful!';

        document.getElementById('depositAmount').value = '';
        document.getElementById('referralCodeInput').value = '';
        
        await loadUserData();
        await checkUserStatus();

        setTimeout(() => {
            depositBtn.innerHTML = originalText;
            depositBtn.disabled = false;
            depositStatus.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error depositing:', error);
        
        const depositBtn = document.getElementById('depositBtn');
        depositBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Deposit BNB';
        depositBtn.disabled = false;

        const depositStatus = document.getElementById('depositStatus');
        depositStatus.style.display = 'block';
        depositStatus.className = 'alert alert-error';
        depositStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${error.message}`;

        showAlert('Deposit failed: ' + error.message, 'error');
    }
}

async function claimReferral() {
    try {
        const claimBtn = document.getElementById('claimReferralBtn');
        const originalText = claimBtn.innerHTML;
        claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        claimBtn.disabled = true;

        const withdrawStatus = document.getElementById('withdrawStatus');
        withdrawStatus.style.display = 'block';
        withdrawStatus.className = 'alert alert-info';
        withdrawStatus.innerHTML = '<i class="fas fa-info-circle"></i> Claiming referral rewards...';

        const tx = await contract.CLAIM();
        
        withdrawStatus.innerHTML = `<i class="fas fa-info-circle"></i> Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        
        await tx.wait();
        
        withdrawStatus.className = 'alert alert-success';
        withdrawStatus.innerHTML = '<i class="fas fa-check-circle"></i> Referral rewards claimed successfully!';

        await loadUserData();

        setTimeout(() => {
            claimBtn.innerHTML = originalText;
            claimBtn.disabled = false;
            withdrawStatus.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error claiming referral:', error);
        handleTransactionError(error, 'claimReferralBtn', '<i class="fas fa-users"></i> Claim Referral Rewards');
        showAlert('Claim referral failed: ' + error.message, 'error');
    }
}

async function withdrawStaking() {
    try {
        const withdrawBtn = document.getElementById('withdrawStakingBtn');
        const originalText = withdrawBtn.innerHTML;
        withdrawBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        withdrawBtn.disabled = true;

        const withdrawStatus = document.getElementById('withdrawStatus');
        withdrawStatus.style.display = 'block';
        withdrawStatus.className = 'alert alert-info';
        withdrawStatus.innerHTML = '<i class="fas fa-info-circle"></i> Withdrawing staking rewards...';

        const tx = await contract.WITHDRAW();
        
        withdrawStatus.innerHTML = `<i class="fas fa-info-circle"></i> Waiting for confirmation... Hash: ${tx.hash.substring(0, 10)}...`;
        
        await tx.wait();
        
        withdrawStatus.className = 'alert alert-success';
        withdrawStatus.innerHTML = '<i class="fas fa-check-circle"></i> Staking rewards withdrawn successfully!';

        await loadUserData();

        setTimeout(() => {
            withdrawBtn.innerHTML = originalText;
            withdrawBtn.disabled = false;
            withdrawStatus.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error withdrawing staking:', error);
        handleTransactionError(error, 'withdrawStakingBtn', '<i class="fas fa-chart-line"></i> Withdraw Staking Rewards');
        showAlert('Withdraw staking failed: ' + error.message, 'error');
    }
}

function handleTransactionError(error, buttonId, originalText) {
    const button = document.getElementById(buttonId);
    const withdrawStatus = document.getElementById('withdrawStatus');
    
    button.innerHTML = originalText;
    button.disabled = false;
    
    withdrawStatus.style.display = 'block';
    withdrawStatus.className = 'alert alert-error';
    withdrawStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${error.message}`;
}

function switchTab(tabName) {
    const navLinks = document.querySelectorAll('.nav-links a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => link.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[href="#${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    alert.style.margin = '1rem';
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.minWidth = '300px';
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    document.body.appendChild(container);
    return container;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    connectWalletBtn.addEventListener('click', connectWallet);
    
    // Auto-connect if previously connected
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) {
                connectWallet();
            }
        });
    }
});
