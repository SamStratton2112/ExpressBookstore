const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookschema = require("../schemas/bookSchema.json")
const ExpressError = require("../expressError")


const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const book = await Book.create(req.body);
    const result = jsonschema.validate(book, bookschema);
    if(!result.valid){
      const allErrors = result.errors.map(e=> e.stack);
      const err = new ExpressError(allErrors, 400);
      console.log(result)
      return next(err);
    }
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.update(req.params.isbn, req.body);
    const result = jsonschema.validate(book, bookschema);
    if(!result.valid){
      const allErrors = result.errors.map(e=> e.stack);
      const err = new ExpressError(allErrors, 400);
      console.log(result)
      return next(err);
    }
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
