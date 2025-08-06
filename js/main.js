let currentPage = 1;
let totalPages = 1;

function showMessage(message, type = 'success') {
  const container = document.getElementById('messageContainer')
  const messageDiv = document.createElement('div')
  messageDiv.className = `p-4 rounded-lg shadow-lg text-white mb-2 transition-all duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
  messageDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-2"></i>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
  container.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove()
    }
  }, 5000)
}

async function loadCategories() {
  try {
    const res = await fetch('api/categories.php')
    const categories = await res.json()

    const filterSelect = document.getElementById('categoryFilter')
    filterSelect.innerHTML = `<option value="">All Categories</option>` +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')

    const bookCategorySelect = document.getElementById('bookCategory');
    bookCategorySelect.innerHTML = `<option value="">Select Category</option>` +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')

    const categoriesList = document.getElementById('categoriesList');
    if (categoriesList) {
      categoriesList.innerHTML = categories.length === 0
        ? '<p class="text-gray-500 text-center py-4">No categories found</p>'
        : categories.map(c => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">${c.name}</span>
                <button 
                  onclick="deleteCategory(${c.id}, '${c.name}')" 
                  class="text-red-600 hover:text-red-800 transition duration-200"
                  title="Delete category"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('')
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showMessage('Failed to load categories', 'error');
  }
}

async function saveCategory(event) {
  event.preventDefault()
  const categoryName = document.getElementById('categoryName').value.trim();

  if (!categoryName) {
    showMessage('Please enter a category name', 'error')
    return
  }

  try {
    const response = await fetch('api/categories.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName })
    })

    const result = await response.json();

    if (result.success) {
      showMessage('Category added successfully');
      document.getElementById('categoryName').value = '';
      loadCategories();
    } else {
      showMessage('Failed to add category', 'error')
    }
  } catch (error) {
    console.error('Error saving category:', error)
    showMessage('Failed to add category', 'error')
  }
}

async function deleteCategory(id, name) {
  if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
    return
  }

  try {
    const response = await fetch('api/categories.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    })

    const result = await response.json();

    if (result.success) {
      showMessage('Category deleted successfully')
      loadCategories();
      loadBooks();
    } else {
      showMessage('Failed to delete category', 'error')
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    showMessage('Failed to delete category', 'error')
  }
}

async function loadBooks(page = 1) {
  try {
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchInput').value;
    const date = document.getElementById('dateInput').value;

    currentPage = page
    let url = `api/books.php?page=${page}`

    if (category) url += `&category=${category}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (date) url += `&publication_date=${date}`

    const response = await fetch(url)
    const result = await response.json()

    const container = document.getElementById('booksList')
    const totalCount = document.getElementById('totalCount')

    totalCount.textContent = `Total: ${result.total} books`

    if (result.books.length === 0) {
      container.innerHTML = `
            <div class="text-center py-12">
              <i class="fas fa-book-open text-4xl text-gray-300 mb-4"></i>
              <p class="text-gray-500 text-lg">No books found</p>
              <p class="text-gray-400">Try adjusting your search criteria</p>
            </div>
          `;
    } else {
      container.innerHTML = result.books.map(b => `
            <div class="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-800 mb-2">${b.title}</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                    <p><i class="fas fa-user text-indigo-500 mr-2"></i><strong>Author:</strong> ${b.author}</p>
                    <p><i class="fas fa-building text-indigo-500 mr-2"></i><strong>Publisher:</strong> ${b.publisher}</p>
                    <p><i class="fas fa-calendar text-indigo-500 mr-2"></i><strong>Published:</strong> ${b.publication_date}</p>
                    <p><i class="fas fa-file-alt text-indigo-500 mr-2"></i><strong>Pages:</strong> ${b.pages}</p>
                    <p class="md:col-span-2"><i class="fas fa-tag text-indigo-500 mr-2"></i><strong>Category:</strong> ${b.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                  <button 
                    onclick="editBook(${JSON.stringify(b).replace(/"/g, '&quot;')})" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
                    title="Edit book"
                  >
                    <i class="fas fa-edit mr-1"></i>
                    Edit
                  </button>
                  <button 
                    onclick="deleteBook(${b.id}, '${b.title.replace(/'/g, "\\'")}')" 
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
                    title="Delete book"
                  >
                    <i class="fas fa-trash mr-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `).join('')
    }

    renderPagination(result.total);
  } catch (error) {
    console.error('Error loading books:', error)
    showMessage('Failed to load books', 'error')
  }
}

function renderPagination(total) {
  const perPage = 5
  totalPages = Math.ceil(total / perPage)
  const wrapper = document.getElementById('pagination')
  wrapper.innerHTML = ''

  if (totalPages <= 1) return

  // prev btn
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left mr-1"></i>Previous';
    prevBtn.className = 'px-4 py-2 mx-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200';
    prevBtn.onclick = () => loadBooks(currentPage - 1);
    wrapper.appendChild(prevBtn);
  }

  // Page num
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)

  if (startPage > 1) {
    const firstBtn = document.createElement('button')
    firstBtn.innerText = '1'
    firstBtn.className = 'px-3 py-2 mx-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200'
    firstBtn.onclick = () => loadBooks(1)
    wrapper.appendChild(firstBtn);

    if (startPage > 2) {
      const ellipsis = document.createElement('span')
      ellipsis.innerText = '...';
      ellipsis.className = 'px-2 py-2 mx-1 text-gray-500'
      wrapper.appendChild(ellipsis)
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button')
    btn.innerText = i
    btn.className = `px-3 py-2 mx-1 border rounded-lg transition duration-200 ${i === currentPage
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white border-gray-300 hover:bg-gray-50'
      }`;
    btn.onclick = () => loadBooks(i)
    wrapper.appendChild(btn)
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span')
      ellipsis.innerText = '...'
      ellipsis.className = 'px-2 py-2 mx-1 text-gray-500'
      wrapper.appendChild(ellipsis)
    }

    const lastBtn = document.createElement('button')
    lastBtn.innerText = totalPages
    lastBtn.className = 'px-3 py-2 mx-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200'
    lastBtn.onclick = () => loadBooks(totalPages)
    wrapper.appendChild(lastBtn)
  }

  // Next button
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button')
    nextBtn.innerHTML = 'Next<i class="fas fa-chevron-right ml-1"></i>';
    nextBtn.className = 'px-4 py-2 mx-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200';
    nextBtn.onclick = () => loadBooks(currentPage + 1)
    wrapper.appendChild(nextBtn)
  }
}

function openBookModal(book = null) {
  document.getElementById("bookModalTitle").innerText = book ? "Edit Book" : "Add Book"
  document.getElementById("bookModal").classList.remove("hidden");
  document.getElementById("bookModal").classList.add("flex")
  document.getElementById("bookForm").reset()

  if (book) {
    document.getElementById("bookId").value = book.id;
    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookDate").value = book.publication_date;
    document.getElementById("bookPublisher").value = book.publisher;
    document.getElementById("bookPages").value = book.pages;
    document.getElementById("bookCategory").value = book.category_id;
  } else {
    document.getElementById("bookId").value = ""
  }
}

function closeBookModal() {
  document.getElementById("bookModal").classList.add("hidden")
  document.getElementById("bookModal").classList.remove("flex")
}

function openCategoryModal() {
  document.getElementById("categoryModal").classList.remove("hidden")
  document.getElementById("categoryModal").classList.add("flex")
  loadCategories();
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.add("hidden")
  document.getElementById("categoryModal").classList.remove("flex")
}

function editBook(book) {
  openBookModal(book)
}

async function deleteBook(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) {
    return
  }

  try {
    const response = await fetch('api/books.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    })
    const result = await response.json();

    if (result.success) {
      showMessage('Book deleted successfully')
      loadBooks(currentPage)
    } else {
      showMessage('Failed to delete book', 'error')
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    showMessage('Failed to delete book', 'error')
  }
}

async function saveBook(event) {
  event.preventDefault()

  const bookData = {
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    publication_date: document.getElementById('bookDate').value,
    publisher: document.getElementById('bookPublisher').value,
    pages: parseInt(document.getElementById('bookPages').value),
    category_id: parseInt(document.getElementById('bookCategory').value)
  }

  const bookId = document.getElementById('bookId').value
  const isEdit = bookId !== ''

  if (isEdit) {
    bookData.id = parseInt(bookId)
  }

  try {
    const response = await fetch('api/books.php', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    })

    const result = await response.json()

    if (result.success) {
      showMessage(isEdit ? 'Book updated successfully' : 'Book added successfully')
      closeBookModal()
      loadBooks(currentPage)
    } else {
      showMessage('Failed to save book', 'error')
    }
  } catch (error) {
    console.error('Error saving book:', error)
    showMessage('Failed to save book', 'error')
  }
}

document.getElementById('bookForm').addEventListener('submit', saveBook)
document.getElementById('categoryForm').addEventListener('submit', saveCategory)

document.getElementById('searchInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    loadBooks()
  }
});

// Close modal ketika click di outside
document.getElementById('bookModal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeBookModal()
  }
});

document.getElementById('categoryModal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeCategoryModal()
  }
});

window.addEventListener('load', function () {
  loadCategories()
  loadBooks();
})