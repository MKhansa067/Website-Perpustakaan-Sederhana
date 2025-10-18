$(document).ready(function() {
    // Data buku (simulasi database)
    let books = JSON.parse(localStorage.getItem('books')) || [
        {
            id: 1,
            title: "Pemrograman JavaScript Modern",
            author: "John Doe",
            category: "Teknologi",
            description: "Buku lengkap tentang JavaScript modern dengan ES6+ dan framework populer.",
            cover: "assets/images/js-book.jpg",
            pdf: "https://drive.google.com/file/d/1ABC123DEF456GHI789JKL/view?usp=sharing"
        },
        {
            id: 2,
            title: "Sejarah Indonesia",
            author: "Prof. Ahmad",
            category: "Sejarah",
            description: "Pembahasan mendalam tentang sejarah Indonesia dari masa kerajaan hingga kemerdekaan.",
            cover: "assets/images/history-book.jpg",
            pdf: "https://drive.google.com/file/d/2XYZ789ABC123DEF456GHI/view?usp=sharing"
        }
    ];

    // Simpan data ke localStorage
    localStorage.setItem('books', JSON.stringify(books));

    // Render buku
    function renderBooks(filteredBooks = books) {
        const booksGrid = $('#booksGrid');
        const noResults = $('#noResults');
        
        if (filteredBooks.length === 0) {
            booksGrid.hide();
            noResults.show();
            return;
        }

        noResults.hide();
        booksGrid.show().empty();

        filteredBooks.forEach(book => {
            const bookCard = $(`
                <div class="book-card" data-id="${book.id}">
                    <div class="book-cover">
                        ${book.cover ? 
                            `<img src="${book.cover}" alt="${book.title}" class="book-cover-img">` : 
                            `<i class="fas fa-book"></i>`
                        }
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">Oleh: ${book.author}</p>
                        <span class="book-category">${book.category}</span>
                        <p class="book-description">${book.description}</p>
                        <div class="book-actions">
                            <button class="btn btn-primary view-pdf" data-pdf="${book.pdf}" data-title="${book.title}">
                                <i class="fas fa-eye"></i>
                                Lihat PDF
                            </button>
                        </div>
                    </div>
                </div>
            `);
            booksGrid.append(bookCard);
        });
    }

    // Populate filter options
    function populateFilters() {
        const categories = [...new Set(books.map(book => book.category))];
        const authors = [...new Set(books.map(book => book.author))];

        const categoryFilter = $('#categoryFilter');
        const authorFilter = $('#authorFilter');

        // Clear existing options except first
        categoryFilter.find('option:not(:first)').remove();
        authorFilter.find('option:not(:first)').remove();

        categories.forEach(category => {
            categoryFilter.append(`<option value="${category}">${category}</option>`);
        });

        authors.forEach(author => {
            authorFilter.append(`<option value="${author}">${author}</option>`);
        });
    }

    // Filter books
    function filterBooks() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const categoryFilter = $('#categoryFilter').val();
        const authorFilter = $('#authorFilter').val();

        const filteredBooks = books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                                book.author.toLowerCase().includes(searchTerm) ||
                                book.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || book.category === categoryFilter;
            const matchesAuthor = !authorFilter || book.author === authorFilter;

            return matchesSearch && matchesCategory && matchesAuthor;
        });

        renderBooks(filteredBooks);
    }

    // View PDF - Updated for Google Drive links
    $(document).on('click', '.view-pdf', function() {
        const pdfData = $(this).data('pdf');
        const bookTitle = $(this).data('title');
        
        if (pdfData) {
            // Check if it's a Google Drive link
            if (pdfData.includes('drive.google.com')) {
                // Open Google Drive PDF in new tab
                window.open(pdfData, '_blank');
            } else if (pdfData.startsWith('data:application/pdf')) {
                // Handle base64 PDFs (for existing data)
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>${bookTitle}</title>
                                <style>
                                    body { 
                                        margin: 0; 
                                        padding: 0; 
                                        background: #f0f0f0;
                                    }
                                    .pdf-container {
                                        width: 100vw;
                                        height: 100vh;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                    }
                                    iframe { 
                                        width: 90vw; 
                                        height: 90vh; 
                                        border: none; 
                                        border-radius: 8px;
                                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="pdf-container">
                                    <iframe src="${pdfData}" type="application/pdf"></iframe>
                                </div>
                            </body>
                        </html>
                    `);
                } else {
                    alert('Popup blocker mencegah pembukaan PDF. Silakan izinkan popup untuk situs ini.');
                }
            } else {
                // Regular URL
                window.open(pdfData, '_blank');
            }
        } else {
            alert('File PDF tidak tersedia!');
        }
    });

    // Close PDF Modal
    $('.modal-close').on('click', function() {
        $('#pdfModal').hide();
        $('#pdfViewer').attr('src', '');
    });

    $(window).on('click', function(e) {
        if (e.target.id === 'pdfModal') {
            $('#pdfModal').hide();
            $('#pdfViewer').attr('src', '');
        }
    });

    // Event listeners
    $('#searchInput').on('input', filterBooks);
    $('#categoryFilter').on('change', filterBooks);
    $('#authorFilter').on('change', filterBooks);

    // Initialize
    renderBooks();
    populateFilters();
});
