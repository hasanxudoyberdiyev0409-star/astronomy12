// ========== CANVAS YULDUZLI FON (FAQAT AGAR #starfield MAVJUD BO‘LSA) ==========
var starfieldCanvas = document.getElementById('starfield');

if (starfieldCanvas) {
    var starCtx = starfieldCanvas.getContext('2d');
    
    var stars = [];
    var STAR_COUNT = 250;
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var parallaxEnabled = window.innerWidth >= 900;

    function createStars() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * starfieldCanvas.width,
                y: Math.random() * starfieldCanvas.height,
                radius: Math.random() * 2.5 + 0.3,
                opacity: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 0.015 + 0.003,
                direction: Math.random() > 0.5 ? 1 : -1,
                depth: Math.random() * 0.8 + 0.2
            });
        }
    }

    function resizeCanvas() {
        var hero = document.getElementById('hero');
        if (!hero) return;
        var rect = hero.getBoundingClientRect();
        starfieldCanvas.width = rect.width;
        starfieldCanvas.height = rect.height;
        createStars();
    }

    function drawStars() {
        var hero = document.getElementById('hero');
        if (!hero) return;
        var rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            requestAnimationFrame(drawStars);
            return;
        }

        starCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);

        for (var i = 0; i < stars.length; i++) {
            var star = stars[i];
            var dx = 0, dy = 0;
            if (parallaxEnabled) {
                var centerX = starfieldCanvas.width / 2;
                var centerY = starfieldCanvas.height / 2;
                var offsetX = (mouseX - window.innerWidth / 2) / (window.innerWidth / 2);
                var offsetY = (mouseY - window.innerHeight / 2) / (window.innerHeight / 2);
                dx = offsetX * 30 * star.depth;
                dy = offsetY * 30 * star.depth;
            }

            var drawX = star.x + dx;
            var drawY = star.y + dy;

            starCtx.beginPath();
            starCtx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
            starCtx.fillStyle = 'rgba(255, 255, 255, ' + star.opacity + ')';
            starCtx.fill();

            if (star.radius > 1.8) {
                starCtx.beginPath();
                starCtx.arc(drawX, drawY, star.radius * 2.5, 0, Math.PI * 2);
                starCtx.fillStyle = 'rgba(167, 139, 250, ' + (star.opacity * 0.15) + ')';
                starCtx.fill();
            }

            star.opacity += star.speed * star.direction;
            if (star.opacity > 0.9) star.direction = -1;
            if (star.opacity < 0.15) star.direction = 1;
        }

        requestAnimationFrame(drawStars);
    }

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('resize', function() {
        resizeCanvas();
        parallaxEnabled = window.innerWidth >= 900;
    });

    resizeCanvas();
    drawStars();
}

// ========== OVERLAY ==========
var overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

// ========== HAMBURGER ==========
var hamburger = document.getElementById('hamburger');
var navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
    function openMenu() {
        navLinks.classList.add('active');
        hamburger.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function() {
        if (navLinks.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
}

// ========== SCROLL REVEAL ==========
function revealOnScroll() {
    var reveals = document.querySelectorAll('.reveal');
    var triggerBottom = window.innerHeight * 0.88;

    for (var i = 0; i < reveals.length; i++) {
        var top = reveals[i].getBoundingClientRect().top;
        if (top < triggerBottom) {
            reveals[i].classList.add('visible');
        }
    }
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
// ========== BOSHLASH ==========
resizeCanvas();
drawStars();
// xavfsizlik
console.log("KoinotMap loaded 🚀");