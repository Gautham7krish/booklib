$(document).ready(function () {
  fetchBooks();
  fetchCategories();

  $('#filterOptions').show();
  $('#addBookForm').hide();

  // Toggle panels
  $('#filterBtn').click(function () {
    if (!$('#filterOptions').is(':visible')) {
      $('#filterOptions').fadeIn();
      $('#addBookForm').hide();
      $('#applyFiltersBtn').click();
    }
  });

  $('#addBookBtn').click(function () {
    if (!$('#addBookForm').is(':visible')) {
      $('#addBookForm').fadeIn();
      $('#filterOptions').hide();
    }
  });

  // Edit book
  $('#bookList').on('click', '.edit-btn', function () {
    const bookId = $(this).data('id');
    $('html, body').animate({ scrollTop: $('#addBookForm').offset().top }, 500);

    $.get(`http://localhost:8080/Books/${bookId}`, function (book) {
      $('#name').val(book.name);
      $('#authorName').val(book.authorName);
      $('#isbn').val(book.isbn);
      $('#price').val(book.price);
      $('#status').val(book.status.toString());
      $('#categoryId').val(book.category.id);

      $('#addBookForm').data('editing-id', bookId).show();
      $('#addBook').text('Update Book');
      $('#filterOptions').hide();
    });
  });

  // Unified validation message styling
  function showError($element, message) {
    $element.text(`❗ ${message}`).css({ color: 'red', fontSize: '0.9rem' }).show();
  }

  function hideError($element) {
    $element.hide();
  }

  // Field validations
  $('#name').on('input', function () {
    const name = $(this).val().trim();
    const $feedback = $('#nameFeedback');
    if (!name) showError($feedback, 'Name is required.');
    else hideError($feedback);
  });

  $('#authorName').on('input', function () {
    const author = $(this).val().trim();
    const $feedback = $('#authorNameFeedback');
    if (!author) showError($feedback, 'Author name is required.');
    else hideError($feedback);
  });

  $('#isbn').on('input', function () {
    const isbn = $(this).val().trim();
    const $feedback = $('#isbnFeedback');
    const bookId = $('#addBookForm').data('editing-id');

    if (isbn.length === 0) return $feedback.hide();

    $.get(`http://localhost:8080/Books/check-isbn?isbn=${isbn}`, function (exists) {
      if (exists && !bookId) {
        showError($feedback, 'ISBN already exists!');
        $('#addBook').prop('disabled', true);
      } else {
        $feedback.text('✔ ISBN is available.').css({ color: 'green', fontSize: '0.9rem' }).show();
        $('#addBook').prop('disabled', false);
      }
    });
  });

  $('#price').on('input', function () {
    const price = parseFloat($(this).val().trim());
    const $feedback = $('#priceFeedback');
    if (isNaN(price) || price < 1) {
      showError($feedback, 'Minimum Price atleast 1 required ');
    } else {
      hideError($feedback);
    }
  });

  $('#categoryId').on('change', function () {
    const $feedback = $('#categoryFeedback');
    if (!$(this).val()) showError($feedback, 'Please select a category.');
    else hideError($feedback);
  });

  $('#status').on('change', function () {
    const $feedback = $('#statusFeedback');
    if (!$(this).val()) showError($feedback, 'Please select a status.');
    else hideError($feedback);
  });

  // Add or update book
  $('#addBook').click(function (e) {
    e.preventDefault();
    let isValid = true;

    const name = $('#name').val().trim();
    const author = $('#authorName').val().trim();
    const isbn = $('#isbn').val().trim();
    const price = $('#price').val().trim();
    const categoryId = $('#categoryId').val();
    const status = $('#status').val();
    const bookId = $('#addBookForm').data('editing-id');
    const isbnFeedback = $('#isbnFeedback').text();

    if (!name) {
      showError($('#nameFeedback'), 'Name  required.');
      isValid = false;
    }

    if (!author) {
      showError($('#authorNameFeedback'), 'Author name  required.');
      isValid = false;
    }

    if (!isbn || (isbnFeedback.includes('already exists') && !bookId)) {
      showError($('#isbnFeedback'), 'ISBN is required.');
      isValid = false;
    }

    if (!price || isNaN(price) || parseFloat(price) < 1) {
      showError($('#priceFeedback'), 'Price must be at least 1.');
      isValid = false;
    }

    if (!categoryId) {
      showError($('#categoryFeedback'), 'Category required.');
      isValid = false;
    }

    if (!status) {
      showError($('#statusFeedback'), 'Status required.');
      isValid = false;
    }

    if (!isValid) return;

    const book = {
      name,
      authorName: author,
      isbn,
      price: parseFloat(price),
      category: { id: parseInt(categoryId) },
      status: status === 'true'
    };

    const url = bookId ? `http://localhost:8080/Books/${bookId}` : 'http://localhost:8080/Books';
    const method = bookId ? 'PUT' : 'POST';

    $.ajax({
      url,
      type: method,
      contentType: 'application/json',
      data: JSON.stringify(book),
      success: function () {
        alert(bookId ? "Book updated successfully!" : "Book added successfully!");
        location.reload();
      },
      error: function () {
        alert("Error saving book.");
      }
    });
  });

  // Delete book
  $('#bookList').on('click', '.delete-btn', function () {
    const bookId = $(this).data('id');
    const bookName = $(this).data('name');

    if (confirm(`Are you sure you want to delete book with Name: ${bookName}?`)) {
      $.ajax({
        url: `http://localhost:8080/Books/${bookId}`,
        type: 'DELETE',
        success: function () {
          alert("Book deleted successfully!");
          fetchBooks();
        },
        error: function () {
          alert("Error deleting book.");
        }
      });
    }
  });

  // Filter books
  $('#applyFiltersBtn').click(function (e) {
    e.preventDefault();
    const name = $('#searchName').val().toLowerCase();
    const author = $('#searchAuthor').val().toLowerCase();
    const minPrice = parseFloat($('#searchMinPrice').val());
    const maxPrice = parseFloat($('#searchMaxPrice').val());
    const categoryId = $('#searchCategoryId').val();
    const status = $('#searchStatus').val();

    $.get("http://localhost:8080/Books/fetchbooks", function (data) {
      $('#bookList').empty().append('<div class="book-list-header"><h2>Book List</h2></div>');
      let delay = 0;
      let foundMatch = false;

      $.each(data, function (i, book) {
        const matches = (
          (name === '' || book.name?.toLowerCase().includes(name)) &&
          (author === '' || book.authorName?.toLowerCase().includes(author)) &&
          (isNaN(minPrice) || book.price >= minPrice) &&
          (isNaN(maxPrice) || book.price <= maxPrice) &&
          (categoryId === '' || book.category?.id?.toString() === categoryId) &&
          (status === '' || (status === 'true' && book.status) || (status === 'false' && !book.status))
        );

        if (matches) {
          foundMatch = true;
          const card = $(` 
            <div class="book-card" style="display:none; position: relative;">
              <h3>${book.name}</h3>
              <small>Author: ${book.authorName}</small><br>
              <small>Category: ${book.category?.categoryName || 'N/A'}</small><br>
              <small>ISBN: ${book.isbn}</small><br>
              <small>Price: $${book.price}</small><br>
              <small>Status: ${book.status ? 'Available' : 'Unavailable'}</small>
              <div class="book-actions">
                <button class="edit-btn" data-id="${book.id}">✏️</button>
                <button class="delete-btn" data-id="${book.id}" data-name="${book.name}">🗑️</button>
              </div>
            </div>
          `);
          $('#bookList').append(card);
          card.delay(delay).fadeIn(300);
          delay += 100;
        }
      });

      if (!foundMatch) {
        $('#bookList').append('<p style="color:red; padding:1rem;">No books found matching the filter.</p>');
      }
    });
  });

  // Reset filter
  $('form')[0].addEventListener('reset', function () {
    setTimeout(fetchBooks, 0);
  });

  // Load books
  function fetchBooks() {
    $.get("http://localhost:8080/Books/fetchbooks", function (data) {
      $('#bookList').empty().append('<div class="book-list-header"><h2>Book List</h2></div>');
      let delay = 0;

      $.each(data, function (i, book) {
        const card = $(` 
          <div class="book-card" style="display:none; position: relative;">
            <h3>${book.name}</h3>
            <small>Author: ${book.authorName}</small><br>
            <small>Category: ${book.category?.categoryName || 'N/A'}</small><br>
            <small>ISBN: ${book.isbn}</small><br>
            <small>Price: $${book.price}</small><br>
            <small>Status: ${book.status ? 'Available' : 'Unavailable'}</small>
            <div class="book-actions">
              <button class="edit-btn" data-id="${book.id}">✏️</button>
              <button class="delete-btn" data-id="${book.id}" data-name="${book.name}">🗑️</button>
            </div>
          </div>
        `);
        $('#bookList').append(card);
        card.delay(delay).fadeIn(500).animate({ top: '-5px' }, 300);
        delay += 200;
      });
    });
  }

  // Load categories
  function fetchCategories() {
    $.get("http://localhost:8080/Books/Categories", function (data) {
      const $dropdown = $('#categoryId');
      const $filterDropdown = $('#searchCategoryId');
      $dropdown.empty().append('<option value="">Select Category</option>');
      $filterDropdown.empty().append('<option value="">All Categories</option>');
      $.each(data, function (i, category) {
        const option = `<option value="${category.id}">${category.categoryName}</option>`;
        $dropdown.append(option);
        $filterDropdown.append(option);
      });
    });
  }
});