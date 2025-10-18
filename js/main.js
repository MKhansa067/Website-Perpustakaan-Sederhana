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
            pdf: "assets/pdfs/js-book.pdf"
        },
        {
            id: 2,
            title: "Sejarah Indonesia",
            author: "Prof. Ahmad",
            category: "Sejarah",
            description: "Pembahasan mendalam tentang sejarah Indonesia dari masa kerajaan hingga kemerdekaan.",
            cover: "assets/images/history-book.jpg",
            pdf: "assets/pdfs/history-book.pdf"
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
                            <button class="btn btn-primary view-pdf" data-pdf="${book.pdf}">
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

    // Event listeners
    $('#searchInput').on('input', filterBooks);
    $('#categoryFilter').on('change', filterBooks);
    $('#authorFilter').on('change', filterBooks);

    // View PDF
    $(document).on('click', '.view-pdf', function() {
        const pdfPath = $(this).data('pdf');
        window.open(pdfPath, '_blank');
    });

    // Initialize
    renderBooks();
    populateFilters();
});
