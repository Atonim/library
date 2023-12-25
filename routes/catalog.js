const express = require("express");
const router = express.Router();

const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const genre_controller = require("../controllers/genreController");

/// BOOK ROUTES ///

// Главная страница каталога. Отображает список книг
router.get("/", book_controller.index);

// Форма для создания новой книги.
router.get("/book/create", book_controller.book_create_get);

router.post("/book/create", book_controller.book_create_post);

// Удаление книги по её идентификатору.
router.get("/book/:id/delete", book_controller.book_delete_get);

router.post("/book/:id/delete", book_controller.book_delete_post);

// Обновление информации о книге по её идентификатору
router.get("/book/:id/update", book_controller.book_update_get);

router.post("/book/:id/update", book_controller.book_update_post);

// Возврат книги по её идентификатору
router.get("/book/:id/return", book_controller.book_return_get);

// Взять книгу по её идентификатору
router.get("/book/:id/take", book_controller.book_take_get);

router.post("/book/:id/take", book_controller.book_take_post);

// Подробная информация о конкретной книге по её идентификатору
router.get("/book/:id", book_controller.book_detail);

// Список всех книг
router.get("/books", book_controller.book_list);



/// AUTHOR ROUTES ///

// Подробная информация о конкретном авторе по его идентификатору
router.get("/author/:id", author_controller.author_detail);

// Список всех авторов
router.get("/authors", author_controller.author_list);



/// GENRE ROUTES ///

// Подробная информация о конкретном жанре по его идентификатору
router.get("/genre/:id", genre_controller.genre_detail);

// Список всех жанров
router.get("/genres", genre_controller.genre_list);

module.exports = router;



// Маршрут для получения списка книг в наличии
router.get("/books/available", book_controller.getAvailableBooks);

// Маршрут для получения списка просроченных книг
router.get("/books/overdue", book_controller.getOverdueBooks);