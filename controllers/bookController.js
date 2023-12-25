const asyncHandler = require("express-async-handler");

const {body, validationResult} = require("express-validator");

// Обработчики написаны с использованием express-async-handler, что позволяет управлять асинхронными операциями
// в функциях-обработчиках без явного использования блоков try/catch или обработки ошибок с помощью .catch().
// Это упрощает обработку ошибок в асинхронных операциях.

const {
    countAndListBooks,
    countAndListAuthors,
    countAndListGenres,
    countAndListAvailableBooks,
    countAndListOverdueBooks,
    getBookDetails,
    deleteBook,
    addBook,
    updateBook,
    returnBook,
    getBook
} = require("./main");

// Отображает главную страницу сайта
exports.index = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances, authors and genre counts (in parallel)
    const [
        numBooks,
        numAvailableBook,
        numOverdueBook,
        numAuthors,
        numGenres,
    ] = [
        countAndListBooks()[0],
        countAndListAvailableBooks()[0],
        countAndListOverdueBooks()[0],
        countAndListAuthors()[0],
        countAndListGenres()[0],
    ]

    res.render("index", {
        title: "Домашняя библиотека",
        book_count: numBooks,
        book_available_count: numAvailableBook,
        book_overdue_count: numOverdueBook,
        author_count: numAuthors,
        genre_count: numGenres,
    });
});

// Отображает список всех книг
exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = countAndListBooks()[1]
    res.render("book_list", { title: "Список книг", book_list: allBooks});
});

exports.book_detail = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    const [title, author, issue_date, due_date, reader, genre] = a

    res.render("book_detail", {
        title: title,
        author: author,
        genre: genre,
        issue_date: issue_date,
        reader: reader,
        due_date: due_date
    })
});

// Обрабатывает данные, отправленные при создании новой книги (HTTP POST запрос)
exports.book_create_post = [
    body("title", "Название книги не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Имя автора не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("genre", "Название жанра не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        let errorsArray = errors.array(); // Получение массива ошибок

        const { title, author, genre } = req.body; // Извлечение значений из формы

        const [, bookList] = countAndListBooks(); // Деструктурируем массив

        if (bookList.includes(title)) {
            errorsArray.push({ msg: 'Такая книга уже существует в библиотеке' });
        }

        if (errorsArray.length > 0) {
            res.render("book_form", {
                title: "Создание книги",
                author: author,
                genre: genre,
                book: title,
                errors: errors.array(),
            });
        } else {
            addBook(title, author, genre)
            res.redirect('/catalog/book/' + title);
        }
    }),
];

exports.book_create_get = asyncHandler(async (req, res, next) => {
    const { book, author, genre } = req.body; // Извлечение значений из формы
    res.render("book_form", {
        title: "Создание книги",
        author: author,
        genre: genre,
        book: book,
        errors: [],
    })
});

// Отображает форму для удаления книги (HTTP GET запрос)
exports.book_delete_get = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        res.redirect("/catalog/books");
    }

    const [title, author, issue_date, due_date, reader, genre] = a

    res.render("book_delete", {
        title: title,
        author: author,
        genre: genre,
        issue_date: issue_date,
        reader: reader,
        due_date: due_date
    });
});

// Обрабатывает запрос на удаление книги (HTTP POST запрос)
exports.book_delete_post = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        res.redirect("/catalog/books");
    } else {
        const [title, author, issue_date, due_date, reader, genre] = a
        deleteBook(title);
        res.redirect("/catalog/books");
    }
});

// Отображает форму для обновления данных о книге (HTTP GET запрос)
exports.book_update_get = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        res.redirect("/catalog/books");
    }

    const [title, author, issue_date, due_date, reader, genre] = a

    res.render("book_update", {
        title: "Обновление книги",
        author: author,
        genre: genre,
        book: title,
        errors: []
    });
});


// Обрабатывает данные, отправленные при обновлении информации о книге (HTTP POST запрос)
exports.book_update_post = [
    body("title", "Название книги не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Имя автора не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("genre", "Название жанра не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const a = getBookDetails(req.params.id)

        if (a === null) {
            res.redirect("/catalog/books");
        }
        const [old_book, old_author, issue_date, due_date, reader, old_genre] = a

        const errors = validationResult(req);

        let errorsArray = errors.array(); // Получение массива ошибок

        const { title, author, genre } = req.body; // Извлечение значений из формы

        let modifiedTitle = title.replace(/%20/g, ' ');

        const [, bookList] = countAndListBooks(); // Деструктурируем массив

        if(modifiedTitle !== old_book){
            if (bookList.includes(modifiedTitle)) {
                errorsArray.push({ msg: 'Такая книга уже существует в библиотеке' });
            }
        }

        if (errorsArray.length > 0) {
            res.render("book_update", {
                title: "Обновление книги",
                author: old_author,
                genre: old_genre,
                book: old_book,
                errors: errors.array(),
            });
        } else {
            updateBook(old_book, title, author, genre)
            res.redirect('/catalog/book/' + title);
        }
    }),
]

exports.book_return_get = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        res.redirect("/catalog/books");
    }
    const [book, author, issue_date, due_date, reader, genre] = a

    returnBook(req.params.id)
    res.redirect('/catalog/book/' + book);

})

exports.book_take_get = asyncHandler(async (req, res, next) => {
    const a = getBookDetails(req.params.id)

    if (a === null) {
        res.redirect("/catalog/books");
    }

    const [book, author, issue_date, due_date, reader, genre] = a

    res.render("take_book", {
        title: "Получение книги",
        book: book,
        errors: [],
    });

})

exports.book_take_post = [
    body("username", "Имя читателя не может быть пустым")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const a = getBookDetails(req.params.id)

        if (a === null) {
            res.redirect("/catalog/books");
        }
        const [book, author, issue_date, due_date, reader, genre] = a

        const errors = validationResult(req);

        let errorsArray = errors.array(); // Получение массива ошибок

        const { username } = req.body; // Извлечение значений из формы

        let modifiedTitle = book.replace(/%20/g, ' ');

        if(reader !== ""){
            errorsArray.push({ msg: 'Книга находится у другого читателя. Выберите другую' });
        }

        if (errorsArray.length > 0) {
            res.render("take_book", {
                title: "Получение книги",
                book: book,
                errors: errors.array(),
            });
        } else {
            const currentDate = new Date().toISOString().slice(0, 10);
            const dueDate = new Date(currentDate);
            dueDate.setMonth(dueDate.getMonth() + 1);
            dueDate.setDate(1); // Устанавливаем на первое число
            dueDate.setMonth(dueDate.getMonth() + 1); // Переходим на следующий месяц
            dueDate.setDate(0); // Устанавливаем на последний день месяца
            const formattedDueDate = dueDate.toISOString().slice(0, 10);

            getBook(modifiedTitle, currentDate, formattedDueDate, username)
            res.redirect('/catalog/book/' + book);
        }
    }),
]

// Функция для получения списка книг в наличии
exports.getAvailableBooks = asyncHandler(async (req, res, next) => {
    const availableBooks = countAndListAvailableBooks()[1];
    res.render("book_list", { title: "Список доступных книг", book_list: availableBooks});
});

exports.getOverdueBooks = asyncHandler(async (req, res, next) => {
    const overdueBooksList = countAndListOverdueBooks()[1];
    res.render("book_list", { title: "Список просроченных книг", book_list: overdueBooksList});
});