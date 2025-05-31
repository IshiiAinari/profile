// ---------------------- ANTICRAWL ----------------------
// Chặn F12, Ctrl + U, Ctrl + Shift + I
// document.addEventListener("keydown", function (event) {
//     if (event.key === "F12" ||
//         (event.ctrlKey && event.shiftKey && event.key === "I") ||
//         (event.ctrlKey && event.key === "u")) {
//         event.preventDefault();
//     }
// });

// Chặn chuột phải
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// ---------------------- LOADING ----------------------
const loadingScreen = document.querySelector('.loading-screen');
const loadingContent = document.querySelector('.loading-content');

// Set the ASCII art text
loadingContent.textContent = ` ___    _    _ _     _   _               _ 
|_ _|__| |_ (_|_)   /_\\ (_)_ _  __ _ _ _(_)
 | |(_-< ' \\| | |  / _ \\| | ' \\/ _\` | '_| |
|___/__/_||_|_|_| /_/ \\_\\_|_||_\\__,_|_| |_|
                                            `;

// Show music popup immediately with loading screen
setTimeout(showMusicPopup, 500);

// Function to handle loading screen fade out
function fadeOutLoadingScreen() {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 800); // Match with transition duration
}

// Viewport Height Correction
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setViewportHeight);
setViewportHeight();

// Touch Device Detection
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Mobile Interaction Adjustments
if(isTouchDevice) {
    document.documentElement.style.setProperty('--hover-effect', 'none');
    document.querySelectorAll('a, button').forEach(el => {
        el.style.touchAction = 'manipulation';
    });
}

// ---------------------- TYPING ----------------------
class TxtType {
    constructor(el, toRotate, period) {
        this.el = el;
        this.toRotate = toRotate;
        this.period = parseInt(period, 10) || 2000;
        this.loopNum = 0;
        this.txt = '';
        this.isDeleting = false;

        this.el.innerHTML = '<span class="wrap"></span>';
        this.wrapEl = this.el.querySelector('.wrap');

        this.tick();
    }

    tick() {
        const fullTxt = this.toRotate[this.loopNum % this.toRotate.length];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.wrapEl.textContent = this.txt;

        let delta;
        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 800;
        } else {
            delta = this.isDeleting ? 100 : 70;
        }

        setTimeout(() => this.tick(), delta);
    }
}

window.onload = function () {
    document.querySelectorAll('.typewrite').forEach(element => {
        const toRotate = element.getAttribute('data-type');
        const period = element.getAttribute('data-period');
        if (toRotate) {
            new TxtType(element, JSON.parse(toRotate), period);
        }
    });
};

// ---------------------- MUSIC ----------------------
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('audioPlayer');
const volumeBar = document.getElementById('volumeBar');
const volumeProgress = document.getElementById('volumeProgress');
const volumeHandle = document.getElementById('volumeHandle');

let hasPlayed = false;
let isPlaying = false;
let isDragging = false;
let mobileVolumeTimer = null;

// function initPlayOnce(e) {
//     if (!hasPlayed) {
//         hasPlayed = true;
//         audio.play().catch(err => console.error("Lỗi phát nhạc:", err));
//         document.removeEventListener("click", initPlayOnce);
//         document.removeEventListener("touchstart", initPlayOnce);
//         isPlaying = true;
//         musicToggle.classList.add("active");
//         toggleIcon();
//     }
// }

// document.addEventListener("click", initPlayOnce);
// document.addEventListener("touchstart", initPlayOnce);

function togglePlay() {
    if (audio.paused) {
        audio.play();
        isPlaying = true;
    } else {
        audio.pause();
        isPlaying = false;
    }
    musicToggle.classList.toggle("active");
    toggleIcon();
}

function toggleIcon() {
    const playIcon = document.getElementById("playIcon");
    if (isPlaying) {
        playIcon.classList.remove("fa-play");
        playIcon.classList.add("fa-pause");
    } else {
        playIcon.classList.remove("fa-pause");
        playIcon.classList.add("fa-play");
    }
}

function updateVolume(clientX) {
    const rect = volumeBar.getBoundingClientRect();
    const position = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const volume = position / rect.width;
    
    audio.volume = Math.max(0, Math.min(volume, 1));
    
    const percentage = volume * 100;
    volumeProgress.style.width = `${percentage}%`;
    volumeHandle.style.left = `${percentage}%`;
    
    const volumeIcon = document.querySelector('.volume-icon i');
    volumeIcon.className = 'fas ' + (
        volume === 0 ? 'fa-volume-mute' :
        volume < 0.5 ? 'fa-volume-down' :
        'fa-volume-up'
    );
}

// Mouse events for volume control
volumeBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    volumeHandle.classList.add('dragging');
    updateVolume(e.clientX);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateVolume(e.clientX);
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        volumeHandle.classList.remove('dragging');
    }
});

// Touch events for mobile devices
volumeBar.addEventListener('touchstart', (e) => {
    isDragging = true;
    volumeHandle.classList.add('dragging');
    updateVolume(e.touches[0].clientX);
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updateVolume(e.touches[0].clientX);
        e.preventDefault();
    }
});

document.addEventListener('touchend', () => {
    if (isDragging) {
        isDragging = false;
        volumeHandle.classList.remove('dragging');
    }
});

// Prevent text selection while dragging
document.addEventListener('selectstart', (e) => {
    if (isDragging) {
        e.preventDefault();
    }
});

// Set initial volume
audio.volume = 0.5;
updateVolume(volumeBar.getBoundingClientRect().left + (volumeBar.offsetWidth * 0.5));

// ---------------------- DISCORD INFO ----------------------
async function fetchDiscordServerInfo(inputUrl) {
    try {
        const match = inputUrl.match(/(?:https?:\/\/)?discord\.gg\/([\w\d-]+)/);
        if (!match) {
            console.error("URL không hợp lệ!");
            return;
        }
        const inviteCode = match[1];
        const inviteElement = document.querySelector(".discord-invite");
        if (inviteElement) inviteElement.textContent = `discord.gg/${inviteCode}`;
        
        const inviteClickable = document.querySelector(".discord-invite-click");
        if (inviteClickable) {
            inviteClickable.style.cursor = "pointer";
            inviteClickable.addEventListener("click", () => {
                window.open(`https://discord.gg/${inviteCode}`, "_blank");
            });
        }
        
        const inviteResponse = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true&with_expiration=true`);
        const inviteData = await inviteResponse.json();
        if (!inviteData.guild?.id) {
            console.error("Không tìm thấy thông tin server!");
            return;
        }
        document.querySelector(".discord-name").textContent = inviteData.guild.name;
        document.querySelector(".discord-avatar").src =
            `https://cdn.discordapp.com/icons/${inviteData.guild.id}/${inviteData.guild.icon}.png`;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin server:", error);
    }
}

// ---------------------- PAYMENT INFO ----------------------
function showPaymentInfo() {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
        <div class="popup-content">
            <div class="close-popup">✖</div>
            <h2 style="text-align:center; margin-bottom:1rem;">Thông Tin Thanh Toán</h2>
            <p style="text-align:center; margin-bottom:1.5rem;">Vui lòng chọn hình thức thanh toán</p>
            <div class="popup-buttons">
                <button class="payment-option" data-type="momo">MOMO</button>
                <button class="payment-option" data-type="sacombank">SACOMBANK</button>
            </div>
            <div class="payment-info" style="display:none; margin-top:1.5rem; text-align:center;">
                <h3 style="margin-bottom:0.5rem;">Thông Tin Tài Khoản</h3>
                <img class="qr-code" src="">
                <p class="bank-info"></p>
                <p class="account-number"></p>
                <p class="account-name"></p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add("show"), 10);

    overlay.querySelector(".close-popup").addEventListener("click", closePopup);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closePopup();
        }
    });

    function closePopup() {
        overlay.classList.add("hide");
        setTimeout(() => overlay.remove(), 500);
    }

    overlay.querySelectorAll(".payment-option").forEach(button => {
        button.addEventListener("click", function () {
            const type = this.getAttribute("data-type");
            showAccountInfo(type, overlay);
        });
    });
}

function showAccountInfo(type, overlay) {
    let bank = "", accountNumber = "", accountName = "", qrcode = "";
    if (type === "momo") {
        bank = "MOMO";
        accountNumber = "0778653868";
        accountName = "Nguyễn Tấn Lợi";
        qrcode = 'source/momo.png';
    } else if (type === "sacombank") {
        bank = "SACOMBANK";
        accountNumber = "060293193668";
        accountName = "Nguyễn Tấn Lợi";
        qrcode = 'source/sacombank.png';
    }
    
    const infoDiv = overlay.querySelector(".payment-info");
    infoDiv.style.display = "block";
    infoDiv.querySelector(".qr-code").src = qrcode;
    infoDiv.querySelector(".bank-info").textContent = `Ngân hàng: ${bank}`;
    infoDiv.querySelector(".account-number").textContent = `Số tài khoản: ${accountNumber}`;
    infoDiv.querySelector(".account-name").textContent = `Chủ tài khoản: ${accountName}`;
}

// ---------------------- MUSIC POPUP ----------------------
function showMusicPopup() {
    const overlay = document.getElementById('musicPopupOverlay');
    
    // Update popup content to Vietnamese
    overlay.innerHTML = `
        <div class="music-popup">
            <h2>Bạn có muốn bật nhạc không?</h2>
            <div class="music-popup-buttons">
                <button class="music-popup-button" onclick="enableMusic(true)">Có</button>
                <button class="music-popup-button" onclick="enableMusic(false)">Không</button>
            </div>
        </div>
    `;
    
    // Show popup with animation
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });
}

function enableMusic(enable) {
    const overlay = document.getElementById('musicPopupOverlay');
    
    // Hide popup
    overlay.classList.add('hide');
    
    if (enable) {
        audio.play().catch(err => console.error("Error playing music:", err));
        isPlaying = true;
        musicToggle.classList.add("active");
    }
    
    // Fade out loading screen after music choice
    setTimeout(fadeOutLoadingScreen, 300);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchDiscordServerInfo("https://discord.gg/WffnP4sQ4K");
    document.querySelectorAll(".show-payment-info").forEach(el => {
        el.addEventListener("click", showPaymentInfo);
    });
    
    // Update social links to open in new tab
    document.querySelectorAll('.social-link').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}); 