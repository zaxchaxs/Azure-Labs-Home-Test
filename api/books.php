<?php
include '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $pubdate = $_GET['publication_date'] ?? null;

    // Pagination
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = 5;
    $offset = ($page - 1) * $limit;

    $whereConditions = ["1=1"];
    $params = [];
    $types = "";

    if ($category) {
      $whereConditions[] = "books.category_id = ?";
      $params[] = intval($category);
      $types .= "i";
    }

    if ($search) {
      $whereConditions[] = "(books.title LIKE ? OR books.author LIKE ? OR books.publisher LIKE ?)";
      $searchTerm = "%$search%";
      $params[] = $searchTerm;
      $params[] = $searchTerm;
      $params[] = $searchTerm;
      $types .= "sss";
    }

    if ($pubdate) {
      $whereConditions[] = "books.publication_date = ?";
      $params[] = $pubdate;
      $types .= "s";
    }

    $whereClause = implode(" AND ", $whereConditions);

    // count query buat pagination
    $countQuery = "SELECT COUNT(*) AS total FROM books WHERE $whereClause";

    if (!empty($params)) {
      $countStmt = $conn->prepare($countQuery);
      $countStmt->bind_param($types, ...$params);
      $countStmt->execute();
      $countResult = $countStmt->get_result();
    } else {
      $countResult = $conn->query($countQuery);
    }

    $total = $countResult->fetch_assoc()['total'];

    $query = "SELECT books.*, categories.name as category 
              FROM books 
              LEFT JOIN categories ON books.category_id = categories.id 
              WHERE $whereClause 
              ORDER BY books.id DESC 
              LIMIT $limit OFFSET $offset";

    if (!empty($params)) {
      $stmt = $conn->prepare($query);
      $stmt->bind_param($types, ...$params);
      $stmt->execute();
      $result = $stmt->get_result();
    } else {
      $result = $conn->query($query);
    }

    $books = [];
    while ($row = $result->fetch_assoc()) {
      $books[] = $row;
    }

    echo json_encode([
      'total' => $total,
      'books' => $books,
      'page' => $page,
      'totalPages' => ceil($total / $limit)
    ]);

    break;

  case 'POST':
    try {
      $data = json_decode(file_get_contents("php://input"), true);

      if (!$data) {
        throw new Exception('Invalid JSON data');
      }

      $required = ['title', 'author', 'publication_date', 'publisher', 'pages', 'category_id'];
      foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
          throw new Exception("Field '$field' is required");
        }
      }

      $stmt = $conn->prepare("INSERT INTO books (title, author, publication_date, publisher, pages, category_id) VALUES (?, ?, ?, ?, ?, ?)");
      $stmt->bind_param(
        "ssssii",
        $data['title'],
        $data['author'],
        $data['publication_date'],
        $data['publisher'],
        $data['pages'],
        $data['category_id']
      );

      if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
      } else {
        throw new Exception('Failed to insert book');
      }
    } catch (Exception $e) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    break;

  case 'PUT':
    try {
      $data = json_decode(file_get_contents("php://input"), true);

      if (!$data || !isset($data['id'])) {
        throw new Exception('Invalid data or missing ID');
      }

      $required = ['title', 'author', 'publication_date', 'publisher', 'pages', 'category_id'];
      foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
          throw new Exception("Field '$field' is required");
        }
      }

      $stmt = $conn->prepare("UPDATE books SET title=?, author=?, publication_date=?, publisher=?, pages=?, category_id=? WHERE id=?");
      $stmt->bind_param(
        "ssssiis",
        $data['title'],
        $data['author'],
        $data['publication_date'],
        $data['publisher'],
        $data['pages'],
        $data['category_id'],
        $data['id']
      );

      if ($stmt->execute()) {
        echo json_encode(['success' => true]);
      } else {
        throw new Exception('Failed to update book');
      }
    } catch (Exception $e) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    break;

  case 'DELETE':
    try {
      $data = json_decode(file_get_contents("php://input"), true);

      if (!$data || !isset($data['id'])) {
        throw new Exception('Missing book ID');
      }

      $stmt = $conn->prepare("DELETE FROM books WHERE id=?");
      $stmt->bind_param("i", $data['id']);

      if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
          echo json_encode(['success' => true]);
        } else {
          throw new Exception('Book not found');
        }
      } else {
        throw new Exception('Failed to delete book');
      }
    } catch (Exception $e) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    break;

  default:
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    break;
}

$conn->close();
