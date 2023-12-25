const fs = require('fs');

const path = require('path');

// Получаем полный путь к файлу library.json
const filePath = path.join(__dirname, 'library.json');


// Чтение данных из JSON-файла
const rawData = fs.readFileSync(filePath, 'utf-8');
const library = JSON.parse(rawData);

// 1) Количество книг и список книг
function countAndListBooks() {
    const count = library.length;
    const bookList = library.map(book => book.title);
    return [count, bookList];
}

// 2) Количество разных авторов и список авторов
function countAndListAuthors() {
    // set для уникальных авторов
    const uniqueAuthors = new Set(library.map(book => book.author));
    const count = uniqueAuthors.size;
    return [count, Array.from(uniqueAuthors)];
}

// 3) Количество разных жанров и список жанров
function countAndListGenres() {
    const uniqueGenres = new Set(library.map(book => book.genre));
    const count = uniqueGenres.size;
    return [count, Array.from(uniqueGenres)];
}

// 4) Количество свободных книг и список свободных книг
function countAndListAvailableBooks() {
    const availableBooks = library.filter(book => book.issue_date === '');
    const count = availableBooks.length;
    const availableBookList = availableBooks.map(book => book.title);
    return [count, availableBookList];
}

// 5) Количество просроченных книг и список просроченных книг (на момент текущей даты)
function countAndListOverdueBooks() {
    const currentDate = new Date(); // текущая дата и время в формате Date
    const overdueBooks = library.filter(book => new Date(book.due_date) < currentDate);
    const count = overdueBooks.length;
    const overdueBookList = overdueBooks.map(book => book.title);
    return [count, overdueBookList];
}

// 6) Список книг заданного жанра
function getBooksByGenre(genre) {
    const modifiedGenre = genre.replace(/%20/g, ' ');
    const booksInGenre = library.filter(book => book.genre && book.genre.toLowerCase() === genre.toLowerCase());
    return [modifiedGenre, booksInGenre.map(book => book.title)];
}

// 7) Информация по конкретной книге
function getBookDetails(bookTitle) {
    const modifiedTitle = bookTitle.replace(/%20/g, ' '); // Замена %20 на пробелы

    // Находим книгу по названию
    const foundBook = library.find(book => book.title.toLowerCase() === modifiedTitle.toLowerCase());

    if (!foundBook) {
        return null; // Возвращаем null, если книга не найдена
    }

    const { title, author, issue_date, due_date, reader, genre } = foundBook;
    return [title, author, issue_date, due_date, reader, genre];
}

function getBooksByAuthor(authorName) {
    const modifiedAuthor = authorName.replace(/%20/g, ' ');
    const booksByAuthor = library.filter(book => book.author.toLowerCase() === modifiedAuthor.toLowerCase());
    return [modifiedAuthor, booksByAuthor.map(book => book.title)];
}

function addBook(title, author, genre){
    // Добавление новой книги в массив
    const newBook = {
        "title": title,
        "author": author,
        "issue_date": "",
        "due_date": "",
        "genre": genre
    };

    library.push(newBook);

    // Запись обновленных данных в файл
    fs.writeFile(filePath, JSON.stringify(library, null, 2), (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function deleteBook(title){
    // Находим индекс книги в массиве по названию
    const index = library.findIndex(book => book.title.toLowerCase() === title.toLowerCase());

    if (index !== -1) {
        // Удаляем книгу из массива по индексу
        library.splice(index, 1);

        // Записываем обновленные данные в файл
        fs.writeFile(filePath, JSON.stringify(library, null, 2), (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Книга "${title}" успешно удалена из библиотеки.`);
            }
        });
    } else {
        console.log(`Книга "${title}" не найдена в библиотеке.`);
    }
}

function updateBook(old_book, book, author, genre){
    const index = library.findIndex(book => book.title.toLowerCase() === old_book.toLowerCase());

    if (index !== -1) {
        // Найдена книга - обновляем ее свойства
        library[index].title = book.toString();
        library[index].author = author;
        library[index].genre = genre;

        // Записываем обновленные данные в файл
        fs.writeFile(filePath, JSON.stringify(library, null, 2), (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Информация о книге "${book}" успешно обновлена.`);
            }
        });
    } else {
        console.log(`Книга "${book}" не найдена в библиотеке для обновления.`);
    }
}

function returnBook(bookTitle) {
    const title = bookTitle.replace(/%20/g, ' ');
    const foundBook = library.find(book => book.title.toLowerCase() === title.toLowerCase());

    if (foundBook) {
        if (foundBook.reader !== "") {
            foundBook.reader = "";
            foundBook.issue_date = "";
            foundBook.due_date = "";

            // Записываем обновленные данные в файл
            fs.writeFile(filePath, JSON.stringify(library, null, 2), (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Книг возвращена`);
                }
            });
        } else {
            console.log(`Книга уже находится у читателя.`);
        }
    } else {
        console.log(`Книга не найдена.`);
    }
}

function getBook(title, issue_date, due_date, reader){
    const index = library.findIndex(book => book.title.toLowerCase() === title.toLowerCase());

    if (index !== -1) {
        // Найдена книга - обновляем ее свойства
        library[index].issue_date = issue_date;
        library[index].due_date = due_date;
        library[index].reader = reader;

        // Записываем обновленные данные в файл
        fs.writeFile(filePath, JSON.stringify(library, null, 2), (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Информация о книге успешно обновлена.`);
            }
        });
    } else {
        console.log(`Книга не найдена в библиотеке для обновления.`);
    }
}


module.exports = {
    countAndListBooks,
    countAndListAuthors,
    countAndListGenres,
    countAndListAvailableBooks,
    countAndListOverdueBooks,
    getBooksByGenre,
    getBookDetails,
    getBooksByAuthor,
    addBook,
    deleteBook,
    updateBook,
    returnBook,
    getBook
};