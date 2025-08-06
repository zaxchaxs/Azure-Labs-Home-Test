-- Create database
CREATE DATABASE IF NOT EXISTS bookstore;
USE bookstore;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_publication_date (publication_date),
  INDEX idx_category_id (category_id)
);

-- data sample category
INSERT INTO categories (name) VALUES 
('Fiction'),
('Non-Fiction'),
('Science Fiction'),
('Mystery'),
('Romance'),
('Biography'),
('History'),
('Science'),
('Technology'),
('Self-Help');

-- data sample books
INSERT INTO books (title, author, publication_date, publisher, pages, category_id) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '1925-04-10', 'Charles Scribner\'s Sons', 180, 1),
('To Kill a Mockingbird', 'Harper Lee', '1960-07-11', 'J.B. Lippincott & Co.', 281, 1),
('1984', 'George Orwell', '1949-06-08', 'Secker & Warburg', 328, 1),
('Dune', 'Frank Herbert', '1965-08-01', 'Chilton Books', 688, 3),
('The Martian', 'Andy Weir', '2011-09-27', 'Crown Publishing', 369, 3),
('Sapiens', 'Yuval Noah Harari', '2011-01-01', 'Dvir Publishing House', 443, 2),
('Steve Jobs', 'Walter Isaacson', '2011-10-24', 'Simon & Schuster', 656, 6),
('A Brief History of Time', 'Stephen Hawking', '1988-04-01', 'Bantam Doubleday Dell', 256, 8),
('Clean Code', 'Robert C. Martin', '2008-08-01', 'Prentice Hall', 464, 9),
('The 7 Habits of Highly Effective People', 'Stephen Covey', '1989-08-15', 'Free Press', 372, 10);