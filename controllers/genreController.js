const asyncHandler = require("express-async-handler");


// Обработчики написаны с использованием express-async-handler, что позволяет управлять асинхронными операциями
// в функциях-обработчиках без явного использования блоков try/catch или обработки ошибок с помощью catch().
// Это упрощает обработку ошибок в асинхронных операциях.

const {
    countAndListGenres,
    getBooksByGenre,
} = require("./main");

// Отображает список всех жанров
exports.genre_list = asyncHandler(async (req, res, next) => {
    const allGenres = countAndListGenres()[1]
    res.render("genre_list", {
        title: "Список жанров",
        genre_list: allGenres,
    });
});

// Отображает страницу с подробной информацией о конкретном жанре на основе его идентификатора
exports.genre_detail = asyncHandler(async (req, res, next) => {
    // Get details of genre and all associated books (in parallel)
    const [genre, booksInGenre] = [
        getBooksByGenre(req.params.id)[0],
        getBooksByGenre(req.params.id)[1],
    ]
    if (genre === null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }

    res.render("genre_detail", {
        title: "Книги заданного жанра",
        genre: genre,
        genre_books: booksInGenre,
    });
});
