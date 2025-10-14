function showModule(moduleNumber) {
    // Hide all slides
    document.querySelectorAll('.module-slide').forEach(slide => {
        slide.classList.remove('active');
    });

    // Show selected slide
    document.getElementById('module-' + moduleNumber).classList.add('active');

    // Update button styling
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    const activeBtn = document.querySelectorAll('.slider-btn')[moduleNumber - 1];
    activeBtn.classList.add('active');
}

// Add this function for initializing and managing all carousels
function initCarousels() {
    // Initialize image carousels (Personalization Module)
    initImageCarousel('preference-carousel');

    // Initialize PDF carousels (AI-Simulation)
    initPDFCarousel('simulation-carousel');
}

// Function for image-based carousels
function initImageCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const buttons = carousel.querySelectorAll('.carousel-btn');

    // Set up click handlers for buttons
    buttons.forEach((button, index) => {
        button.onclick = function () {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show selected slide
            slides[index].classList.add('active');

            // Update button styling
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');
        };
    });
}

// Function for PDF-based carousels
function initPDFCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const buttons = carousel.querySelectorAll('.carousel-btn');

    // Render PDFs for this carousel
    renderCarouselPDFs(carouselId);

    // Set up click handlers for buttons
    buttons.forEach((button, index) => {
        button.onclick = function () {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show selected slide
            slides[index].classList.add('active');

            // Update button styling
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');
        };
    });
}

// Function to render PDFs specifically for a carousel
function renderCarouselPDFs(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    // Map of PDF configurations for this carousel
    const pdfConfigs = {
        'simulation-carousel': [
            { url: 'figures/user_simulation/shotwise_accuracy.pdf', canvasId: 'simulation-canvas-0' },
            { url: 'figures/user_simulation/accuracy_histogram.pdf', canvasId: 'simulation-canvas-1' },
            { url: 'figures/user_simulation/simulation_diagnostic.pdf', canvasId: 'simulation-canvas-2' }
        ]
    };

    // If no PDFs for this carousel, exit
    if (!pdfConfigs[carouselId]) return;

    // Set up PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // Calculate the width once
    const carouselWidth = carousel.querySelector('.carousel-container').clientWidth;

    // Render each PDF
    pdfConfigs[carouselId].forEach(config => {
        const canvas = document.getElementById(config.canvasId);
        if (!canvas) return;

        // Load and render PDF
        pdfjsLib.getDocument(config.url).promise
            .then(pdf => pdf.getPage(1))
            .then(page => {
                // Calculate scale based on carousel width
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = carouselWidth / viewport.width * 0.95;
                const scaledViewport = page.getViewport({ scale: scale });

                // Set canvas dimensions
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                // Render PDF
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: scaledViewport
                };

                page.render(renderContext);
            })
            .catch(error => {
                console.error(`Error rendering PDF ${config.url}:`, error);
            });
    });
}

// Replace the existing JavaScript functions
document.addEventListener('DOMContentLoaded', function () {
    // Initialize carousels
    initCarousels();

    // Render standalone PDFs
    renderStandalonePDFs();

    // Initialize zoomable images
    initZoomableImages();
});

// Function to render standalone PDFs (not in carousels)
function renderStandalonePDFs() {
    const standalonePDFs = [
        { url: 'figures/elo_ratings_grouped.pdf', canvasId: 'elo-canvas' },
        { url: 'figures/hallucination_checks_full/faithful_hard_soft_combined_comparison.pdf', canvasId: 'hallucination-canvas' }
    ];

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    standalonePDFs.forEach(config => {
        const canvas = document.getElementById(config.canvasId);
        if (!canvas) return;

        const container = canvas.closest('.pdf-container');
        if (!container) return;

        const containerWidth = container.clientWidth;

        // Load and render PDF
        pdfjsLib.getDocument(config.url).promise
            .then(pdf => pdf.getPage(1))
            .then(page => {
                // Calculate scale
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = containerWidth / viewport.width * 0.95;
                const scaledViewport = page.getViewport({ scale: scale });

                // Set canvas dimensions
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                // Render PDF
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: scaledViewport
                };

                page.render(renderContext);
            })
            .catch(error => {
                console.error(`Error rendering PDF ${config.url}:`, error);
            });
    });

    // Add resize handler
    window.addEventListener('resize', _.debounce(() => {
        renderStandalonePDFs();
        // Re-render carousel PDFs
        renderCarouselPDFs('simulation-carousel');
    }, 250));
}
// Helper function to render PDF page to canvas with proper scaling
function renderPDFToCanvas(page, canvas, container) {
    const containerWidth = container.clientWidth || container.offsetWidth;

    // Calculate scale based on container width
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = containerWidth / viewport.width;

    // Apply the calculated scale (slightly smaller to fit container)
    const scaledViewport = page.getViewport({ scale: scale * 0.95 });

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: scaledViewport
    };

    page.render(renderContext);
}
function showPreferenceSlide(index) {
    // Target the preference carousel specifically
    const carousel = document.getElementById('preference-carousel');
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.removeProperty('position');
        slide.style.removeProperty('opacity');
        slide.style.removeProperty('zIndex');
    });

    // Show selected slide
    slides[index].classList.add('active');

    // Update button styling
    const buttons = carousel.querySelectorAll('.carousel-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    buttons[index].classList.add('active');
}

// Update the simulation slide function similarly
function showSimulationSlide(index) {
    // Target the simulation carousel specifically
    const carousel = document.getElementById('simulation-carousel');
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.removeProperty('position');
        slide.style.removeProperty('opacity');
        slide.style.removeProperty('zIndex');
    });

    // Show selected slide
    slides[index].classList.add('active');

    // Update button styling
    const buttons = carousel.querySelectorAll('.carousel-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    buttons[index].classList.add('active');
}
// Initialize zoomable images
function initZoomableImages() {
    // Create modal element if it doesn't exist
    if (!document.getElementById('imageModal')) {
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'img-modal';

        const modalImg = document.createElement('img');
        modalImg.className = 'img-modal-content';
        modalImg.id = 'modalImg';

        const caption = document.createElement('div');
        caption.className = 'img-modal-caption';
        caption.id = 'modalCaption';

        modal.appendChild(modalImg);
        modal.appendChild(caption);
        document.body.appendChild(modal);

        // Close modal on click
        modal.onclick = function () {
            modal.style.display = 'none';
        };
    }

    // Set up click handlers for all zoomable images
    const zoomables = document.querySelectorAll('.zoomable img');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');

    zoomables.forEach(img => {
        img.onclick = function () {
            modal.style.display = 'flex';
            modalImg.src = this.src;
            modalCaption.innerHTML = this.nextElementSibling ?
                this.nextElementSibling.innerHTML : '';
        };
    });
}
