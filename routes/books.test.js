process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async()=>{
    const addBook = await db.query(
        `INSERT INTO books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES ('1', 'https://test.com/', 'TestAuth', 'TestLang', 1, 'TestPub', 'TestTitle', 2000)
        RETURNING isbn, amazon_url,author,language,pages,publisher,title,year`
    );
    testBook = addBook.rows[0];
});

afterEach(async()=>{
    await db.query("DELETE FROM BOOKS")
})



describe("GET /books", ()=>{
    test("Gets a list of one book", async()=>{
        const res = await request(app).get('/books');
        const books = res.body.books;

        expect(books.length).toEqual(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(res.statusCode).toBe(200);
    })
})

describe("GET /books/:isbn", ()=>{
    test("Gets one book with matching isbn", async()=>{
        const res = await request(app).get(`/books/${testBook.isbn}`);

        expect(res.body.book.author).toBe(testBook.author)
    })
    test("404 when no matching isbn", async()=>{
        const res = await request(app).get(`/books/1111111`);

        expect(res.status).toBe(404)
    })
})

describe("POST /books", ()=>{
    test("Adds one book and returns added book", async()=>{
        const res = await request(app).post('/books').send(
            {
                isbn: '11',
                amazon_url: "https://11.com",
                author: "11Auth",
                language: "11Lang",
                pages: 11,
                publisher: "11pub",
                title: "11Title",
                year: 2011
            }
        );
        const books = res.body;

        expect(books.book).toHaveProperty("isbn");
        expect(res.statusCode).toBe(201);
    })
    test("Stops invalid book creation", async()=>{
        const res = await request(app).post('/books').send(
            {
                isbn: '11',
                amazon_url: "https://11.com",
                author: "11Auth",
                language: "11Lang",
                pages: 11,
                publisher: "11pub"
            }
        );

        expect(res.statusCode).toBe(400);
    })
})

describe("PUT /books/:isbn", ()=>{
    test("Updates book with matching isbn", async ()=>{
        const res = await request(app).put(`/books/${testBook.isbn}`).send({
                amazon_url: "https://test.com/",
                author: "TestAuth",
                language: "TestLang",
                pages: 1,
                publisher: "TestPub",
                title: "testBook",
                year: 2000
            });
        const book = res.body;

        expect(book.book).toHaveProperty("isbn");
        expect(res.statusCode).toBe(200);
        expect(book.book.title).toBe("testBook");
    })
    test("404 when book doesnt exist", async ()=>{
        const res = await request(app).put('/books/1111111').send({
                invalid_input : '111111',
                amazon_url: "https://test.com/",
                author: "TestAuth",
                language: "TestLang",
                pages: 1,
                publisher: "TestPub",
                title: "testBook",
                year: 2000
            });

        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /books/:isbn", function () {
    test("Deletes book with matching isbn", async function () {
      const response = await request(app).delete(`/books/${testBook.isbn}`)

      expect(response.body).toEqual({message: "Book deleted"});
    });
  });

afterAll(async()=>{
    await db.end()
})