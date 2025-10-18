$(document).ready(function() {
    // Check if user is logged in
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin.html';
    }

    // Set admin name
    const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
    $('#adminName').text(adminUsername);

    // Load books data
    let books = JSON.parse(localStorage.getItem('books')) || [];

    // Helper function to convert Google Drive link to direct download
    function convertGoogleDriveLink(url) {
        // Extract file ID from Google Drive URL
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            // Return direct download link
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        return url; // Return original URL if not a Google Drive link
    }

    // Helper function to validate Google Drive link
    function isValidGoogleDriveLink(url) {
        const googleDrivePattern = /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/;
        return googleDrivePattern.test(url);
    }

    // Helper function to compress image
    function compressImage(file, maxWidth = 300, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Navigation
    $('.nav-item').on('click', function(e) {
        e.preventDefault();
        
        if ($(this).data('section')) {
            $('.nav-item').removeClass('active');
            $(this).addClass('active');
            
            $('.content-section').removeClass('active');
            $(`#${$(this).data('section')}-section`).addClass('active');
        }
    });

    // Render books table
    function renderBooksTable() {
        const tbody = $('#booksTableBody');
        tbody.empty();

        books.forEach(book => {
            const row = $(`
                <tr>
                    <td>
                        <div class="book-cover-small">
                            ${book.cover ? 
                                `<img src="${book.cover}" alt="${book.title}" class="book-cover-img">` : 
                                `<i class="fas fa-book"></i>`
                            }
                        </div>
                    </td>
                    <td class="book-title-cell">${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td class="book-description-cell">${book.description}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-sm edit-book" data-id="${book.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-book" data-id="${book.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });
    }

    // Add book form
    $('#addBookForm').on('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const pdfLink = formData.get('pdf');
        
        // Validate Google Drive link
        if (pdfLink && !isValidGoogleDriveLink(pdfLink)) {
            alert('Link Google Drive tidak valid. Pastikan link sudah di-share dengan pengaturan "Anyone with the link can view"');
            return;
        }
        
        const newBook = {
            id: Date.now(),
            title: formData.get('title'),
            author: formData.get('author'),
            category: formData.get('category'),
            description: formData.get('description'),
            cover: null,
            pdf: null
        };

        try {
            // Handle file uploads
            const coverFile = formData.get('cover');

            if (coverFile && coverFile.size > 0) {
                newBook.cover = await compressImage(coverFile);
            }

            if (pdfLink && pdfLink.trim()) {
                newBook.pdf = convertGoogleDriveLink(pdfLink.trim());
            }

            books.push(newBook);
            localStorage.setItem('books', JSON.stringify(books));
            
            renderBooksTable();
            this.reset();
            
            alert('Buku berhasil ditambahkan!');
            
            // Switch to books section
            $('.nav-item').removeClass('active');
            $('.nav-item[data-section="books"]').addClass('active');
            $('.content-section').removeClass('active');
            $('#books-section').addClass('active');
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Terjadi kesalahan saat mengupload file: ' + error.message);
        }
    });

    // Edit book
    $(document).on('click', '.edit-book', function() {
        const bookId = parseInt($(this).data('id'));
        const book = books.find(b => b.id === bookId);
        
        if (book) {
            $('#editBookId').val(book.id);
            $('#editBookTitle').val(book.title);
            $('#editBookAuthor').val(book.author);
            $('#editBookCategory').val(book.category);
            $('#editBookDescription').val(book.description);
            
            // Convert back to original Google Drive link for editing
            if (book.pdf && book.pdf.includes('drive.google.com')) {
                const fileIdMatch = book.pdf.match(/id=([a-zA-Z0-9-_]+)/);
                if (fileIdMatch) {
                    const fileId = fileIdMatch[1];
                    $('#editBookPdf').val(`https://drive.google.com/file/d/${fileId}/view?usp=sharing`);
                }
            } else {
                $('#editBookPdf').val(book.pdf || '');
            }
            
            $('#editBookModal').show();
        }
    });

    // Update book
    $('#editBookForm').on('submit', async function(e) {
        e.preventDefault();
        
        const bookId = parseInt($('#editBookId').val());
        const bookIndex = books.findIndex(b => b.id === bookId);
        
        if (bookIndex !== -1) {
            try {
                const formData = new FormData(this);
                const pdfLink = formData.get('pdf');
                
                // Validate Google Drive link if provided
                if (pdfLink && pdfLink.trim() && !isValidGoogleDriveLink(pdfLink)) {
                    alert('Link Google Drive tidak valid. Pastikan link sudah di-share dengan pengaturan "Anyone with the link can view"');
                    return;
                }
                
                books[bookIndex].title = formData.get('title');
                books[bookIndex].author = formData.get('author');
                books[bookIndex].category = formData.get('category');
                books[bookIndex].description = formData.get('description');
                
                // Handle file uploads
                const coverFile = formData.get('cover');
                
                if (coverFile && coverFile.size > 0) {
                    books[bookIndex].cover = await compressImage(coverFile);
                }
                
                if (pdfLink && pdfLink.trim()) {
                    books[bookIndex].pdf = convertGoogleDriveLink(pdfLink.trim());
                }
                
                localStorage.setItem('books', JSON.stringify(books));
                renderBooksTable();
                $('#editBookModal').hide();
                
                alert('Buku berhasil diperbarui!');
            } catch (error) {
                console.error('Error updating files:', error);
                alert('Terjadi kesalahan saat mengupdate file: ' + error.message);
            }
        }
    });

    // Delete book
    $(document).on('click', '.delete-book', function() {
        if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            const bookId = parseInt($(this).data('id'));
            books = books.filter(b => b.id !== bookId);
            localStorage.setItem('books', JSON.stringify(books));
            renderBooksTable();
            alert('Buku berhasil dihapus!');
        }
    });

    // Modal controls
    $('.modal-close').on('click', function() {
        $('#editBookModal').hide();
    });

    $(window).on('click', function(e) {
        if (e.target.id === 'editBookModal') {
            $('#editBookModal').hide();
        }
    });

    // Add book button
    $('#addBookBtn').on('click', function() {
        $('.nav-item').removeClass('active');
        $('.nav-item[data-section="add-book"]').addClass('active');
        $('.content-section').removeClass('active');
        $('#add-book-section').addClass('active');
    });

    // Cancel button
    $('#cancelBtn').on('click', function() {
        $('.nav-item').removeClass('active');
        $('.nav-item[data-section="books"]').addClass('active');
        $('.content-section').removeClass('active');
        $('#books-section').addClass('active');
    });

    // Logout
    $('#logoutBtn').on('click', function() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            window.location.href = 'admin.html';
        }
    });

    // Initialize
    renderBooksTable();
});
