// Konfigurasi Contract
const CONTRACT_ADDRESS = "0xC1465Fdf616F63ba0dFA565Ce918f13feed2b468"; // Ganti dengan alamat contract yang sudah di-deploy
const CONTRACT_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"Claimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"}],"name":"ReferralReward","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"CLAIM","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_referralCode","type":"string"}],"name":"DEPOSIT","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"WITHDRAW","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getDownlineCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getDownlineList","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getLevelIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewardStaking","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getReferralCode","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTotalInvest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"isRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minWithdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];

// Global Variables
let provider;
let signer;
let contract;
let userAddress;
let isConnected = false;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const heroBtn = document.getElementById('heroBtn');
const investBtn = document.getElementById('investBtn');
const connectFromInvest = document.getElementById('connectFromInvest');
const investContent = document.getElementById('investContent');
const connectPrompt = document.getElementById('connectPrompt');
const withdrawRoiBtn = document.getElementById('withdrawRoiBtn');
const withdrawRefBtn = document.getElementById('withdrawRefBtn');

// Navigation System
function setupNavigation() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    hamburgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Smooth scroll untuk navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                navLinks.classList.remove('active');
            }
        });
    });
}

// FAQ System
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

// Fungsi Utama Connect Wallet
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask first!');
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
        isConnected = true;
        connectWalletBtn.innerHTML = '<i class="fas fa-check"></i> Connected';
        connectWalletBtn.disabled = true;
        heroBtn.innerHTML = '<i class="fas fa-rocket"></i> Invest Now';
        
        // Show invest content, hide connect prompt
        investContent.style.display = 'block';
        connectPrompt.style.display = 'none';

        await loadUserData();

        // Event listeners untuk account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                location.reload();
            } else {
                location.reload();
            }
        });

    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
}

// Load User Data
async function loadUserData() {
    try {
        if (!isConnected) return;

        // Load investment data
        const totalInvest = await contract.getTotalInvest(userAddress);
        document.getElementById('activeDeposit').textContent = 
            ethers.utils.formatEther(totalInvest) + ' BNB';

        // Load reward data
        const pendingReward = await contract.getPendingReward(userAddress);
        const pendingStaking = await contract.getPendingRewardStaking(userAddress);
        const referralReward = pendingReward.sub(pendingStaking);

        document.getElementById('roiBonus').textContent = 
            ethers.utils.formatEther(pendingStaking) + ' BNB';
        document.getElementById('referralBonus').textContent = 
            ethers.utils.formatEther(referralReward) + ' BNB';

        // Load referral data
        await loadReferralData();

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load Referral Data
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

// Invest Function
async function invest() {
    try {
        if (!isConnected) {
            investContent.style.display = 'none';
            connectPrompt.style.display = 'block';
            return;
        }

        const depositAmount = document.getElementById('depositAmount').value;
        const referralCode = document.getElementById('referralCodeInput').value;

        if (!depositAmount || parseFloat(depositAmount) < 0.01) {
            alert('Minimum deposit is 0.01 BNB');
            return;
        }

        const amountInWei = ethers.utils.parseEther(depositAmount);
        
        investBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        investBtn.disabled = true;

        const tx = await contract.DEPOSIT(referralCode, { value: amountInWei });
        await tx.wait();
        
        alert('Investment successful!');
        
        // Reset form
        document.getElementById('depositAmount').value = '';
        document.getElementById('referralCodeInput').value = '';
        
        // Reload data
        await loadUserData();

        investBtn.innerHTML = '<i class="fas fa-rocket"></i> Invest Now';
        investBtn.disabled = false;

    } catch (error) {
        console.error('Error investing:', error);
        alert('Investment failed: ' + error.message);
        investBtn.innerHTML = '<i class="fas fa-rocket"></i> Invest Now';
        investBtn.disabled = false;
    }
}

// Withdraw Functions
async function withdrawROI() {
    try {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        withdrawRoiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        withdrawRoiBtn.disabled = true;

        const tx = await contract.WITHDRAW();
        await tx.wait();
        
        alert('ROI withdrawal successful!');
        await loadUserData();

        withdrawRoiBtn.innerHTML = '<i class="fas fa-chart-line"></i> Withdraw ROI';
        withdrawRoiBtn.disabled = false;

    } catch (error) {
        console.error('Error withdrawing ROI:', error);
        alert('Withdrawal failed: ' + error.message);
        withdrawRoiBtn.innerHTML = '<i class="fas fa-chart-line"></i> Withdraw ROI';
        withdrawRoiBtn.disabled = false;
    }
}

async function withdrawReferral() {
    try {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        withdrawRefBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        withdrawRefBtn.disabled = true;

        const tx = await contract.CLAIM();
        await tx.wait();
        
        alert('Referral withdrawal successful!');
        await loadUserData();

        withdrawRefBtn.innerHTML = '<i class="fas fa-users"></i> Withdraw Referral';
        withdrawRefBtn.disabled = false;

    } catch (error) {
        console.error('Error withdrawing referral:', error);
        alert('Withdrawal failed: ' + error.message);
        withdrawRefBtn.innerHTML = '<i class="fas fa-users"></i> Withdraw Referral';
        withdrawRefBtn.disabled = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupFAQ();
    
    // Event Listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    heroBtn.addEventListener('click', () => {
        if (isConnected) {
            document.querySelector('a[href="#invest"]').click();
        } else {
            connectWallet();
        }
    });
    investBtn.addEventListener('click', invest);
    connectFromInvest.addEventListener('click', connectWallet);
    withdrawRoiBtn.addEventListener('click', withdrawROI);
    withdrawRefBtn.addEventListener('click', withdrawReferral);

    // Auto-connect jika sebelumnya sudah connected
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) {
                connectWallet();
            }
        });
    }
});
