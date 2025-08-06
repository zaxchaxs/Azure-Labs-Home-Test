<?php
include '../db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    $res = $conn->query("SELECT * FROM categories");
    $categories = [];
    while ($row = $res->fetch_assoc()) {
      $categories[] = $row;
    }
    echo json_encode($categories);
    break;

  case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (?)");
    $stmt->bind_param("s", $data['name']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    break;

  case 'PUT':
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $conn->prepare("UPDATE categories SET name = ? WHERE id = ?");
    $stmt->bind_param("si", $data['name'], $data['id']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    break;

  case 'DELETE':
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    break;
}
?>
