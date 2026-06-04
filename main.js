// ========== Sticky Header ==========
window.addEventListener('scroll', function() {
    const header = document.getElementById('main-header');
    const scrollThreshold = window.innerWidth <= 768 ? 200 : 50;
    
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ========== Mobile Menu ==========
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        })
    );
}

// ========== Smooth Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const id = this.getAttribute('href');
        if (id === '#') return;
        const el = document.querySelector(id);
        if (el) {
            e.preventDefault();
            window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

// ========== Hero Slideshow ==========
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
}

if (slides.length > 1) {
    setInterval(() => {
        showSlide((currentSlide + 1) % slides.length);
    }, 6000);

    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            showSlide(parseInt(this.dataset.slide));
        });
    });
}

// ========== Scroll Reveal ==========
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
});

// ========== Gallery Lightbox ==========
document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (galleryItems.length === 0) return;

    // Create Lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <div class="lightbox-content-wrapper">
            <img class="lightbox-content" id="lightbox-img">
        </div>
        <a class="lightbox-prev">&#10094;</a>
        <a class="lightbox-next">&#10095;</a>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const images = Array.from(galleryItems).map(img => img.src);

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden'; // prevent scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    // Attach click events to gallery images
    galleryItems.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index));
    });

    // Controls
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { // minimum swipe distance
            if (diff > 0) showNext(); // Swipe left -> Next
            else showPrev(); // Swipe right -> Prev
        }
    }
});

// ========== Carrusel Miniaturas ALGARROBO ==========
(function() {
    const track = document.getElementById('thumb-track');
    const prevBtn = document.getElementById('thumb-prev');
    const nextBtn = document.getElementById('thumb-next');
    const dotsContainer = document.getElementById('thumb-dots');
    const lightbox = document.getElementById('alg-lightbox');
    const lbImg = document.getElementById('alg-lb-img');
    const lbClose = document.getElementById('alg-lb-close');
    const lbPrev = document.getElementById('alg-lb-prev');
    const lbNext = document.getElementById('alg-lb-next');
    const lbCounter = document.getElementById('alg-lb-counter');

    if (!track) return;

    const items = Array.from(track.querySelectorAll('.thumb-item'));
    const totalImages = items.length;
    const VISIBLE = 4; // miniaturas visibles a la vez
    const totalGroups = Math.ceil(totalImages / VISIBLE);
    let currentGroup = 0;
    let lbIndex = 0;

    // Generar dots en el contenedor ya existente en el HTML
    for (let i = 0; i < totalGroups; i++) {
        const dot = document.createElement('button');
        dot.className = 'thumb-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Grupo ${i + 1}`);
        dot.addEventListener('click', () => goToGroup(i));
        dotsContainer.appendChild(dot);
    }

    function getThumbWidth() {
        if (items[0]) {
            return items[0].offsetWidth + 8; // ancho + gap
        }
        return 110;
    }

    function goToGroup(group) {
        currentGroup = Math.max(0, Math.min(group, totalGroups - 1));
        const offset = currentGroup * VISIBLE * getThumbWidth();
        track.style.transform = `translateX(-${offset}px)`;
        // Actualizar dots
        dotsContainer.querySelectorAll('.thumb-dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentGroup);
        });
        // Actualizar active en thumbs
        updateActiveThumb();
    }

    function updateActiveThumb() {
        items.forEach((item, i) => {
            const inGroup = Math.floor(i / VISIBLE) === currentGroup;
            item.classList.toggle('active', inGroup && i === lbIndex);
        });
    }

    prevBtn.addEventListener('click', () => goToGroup(currentGroup - 1));
    nextBtn.addEventListener('click', () => goToGroup(currentGroup + 1));

    // Click en miniatura -> abrir lightbox
    items.forEach((item, index) => {
        item.addEventListener('click', () => openLb(index));
    });

    // === Lightbox ===
    function openLb(index) {
        lbIndex = index;
        lbImg.src = items[index].querySelector('img').src;
        lbCounter.textContent = `${index + 1} / ${totalImages}`;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Marcar miniatura activa
        items.forEach((it, i) => it.classList.toggle('active', i === index));
        // Navegar al grupo correcto
        goToGroup(Math.floor(index / VISIBLE));
    }

    function closeLb() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function lbGoNext() {
        openLb((lbIndex + 1) % totalImages);
    }

    function lbGoPrev() {
        openLb((lbIndex - 1 + totalImages) % totalImages);
    }

    lbClose.addEventListener('click', closeLb);
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbGoNext(); });
    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbGoPrev(); });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLb();
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowRight') lbGoNext();
        if (e.key === 'ArrowLeft') lbGoPrev();
    });

    // Swipe móvil en lightbox
    let swipeStartX = 0;
    lightbox.addEventListener('touchstart', e => { swipeStartX = e.changedTouches[0].screenX; }, {passive: true});
    lightbox.addEventListener('touchend', e => {
        const diff = swipeStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) lbGoNext();
            else lbGoPrev();
        }
    }, {passive: true});
})();

