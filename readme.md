# Bookstore Management System
## Installation & Setup

### Recruitment
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, or PHP built-in server)

### Clone the Repository
```bash
git clone https://github.com/zaxchaxs/Azure-Labs-Home-Test.git
```

### Database Setup
1. Create a new MySQL database named `bookstore`
2. Import the database schema from db_seed.sql

### Configure Database Connection
Update the database credentials in `db.php`:
```php
<?php
$host = "localhost";        # Your MySQL host
$user = "root";            # Your MySQL username
$pass = "";                # Your MySQL password
$dbname = "bookstore";     # Database name
?>
```

### Step 4: Start the Application
#### Using PHP Built-in Server:
```bash
php -S localhost:8000
```

#### Using XAMPP/WAMP:
1. Copy the project folder to `htdocs` (XAMPP) or `www` (WAMP)
2. Access via `http://localhost/Azure Labs Home Test>`

### Step 5: Access the Application
Open your browser and navigate to:
- PHP Server: `http://localhost:8000`
- XAMPP/WAMP: `http://localhost/Azure Labs Home Test>`

## Usage Guide

### Managing Books

#### Adding a New Book
1. Click the **"Add Book"** button
2. Fill in all required fields:
   - Title
   - Author
   - Publication Date
   - Publisher
   - Number of Pages
   - Category
3. Click **"Save Book"**

#### Editing a Book
1. Find the book you want to edit
2. Click the **"Edit"** button on the book card
3. Modify the fields in the modal
4. Click **"Save Book"**

#### Deleting a Book
1. Find the book you want to delete
2. Click the **"Delete"** button
3. Confirm the deletion in the dialog

### Managing Categories

#### Adding Categories
1. Click **"Manage Categories"**
2. Enter the category name
3. Click **"Add"**

#### Deleting Categories
1. Open the category management modal
2. Click the delete icon next to the category
3. Confirm the deletion

### Searching and Filtering

#### Text Search
- Use the search box to find books by title, author, or publisher
- Results update automatically as you type

#### Date Filtering
- Select a publication date to filter books published on that date

#### Category Filtering
- Choose a category from the dropdown to filter books by category

## 🗄️ Database Schema

### Books Table
```sql
CREATE TABLE books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publication_date DATE NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  pages INT NOT NULL CHECK (pages > 0),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```