const bookModel = require("../model/booksModel")
const reviewModel = require('../model/reviewsModel')
const mongoose = require('mongoose')
const userModel = require("../model/usersModel")

const { uploadFile } = require("../aws/uploadFile");
const validator = require("../Validator/validation")



// GET ALL QUERY BOOK
const createBooks = async (req, res) => {
    try {
      
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body
        let uploadedFileURL;
        let files= req.files
        if(files && files.length>0){
            uploadedFileURL = await uploadFile( files[0] )
        }
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "fill all fields" })

        if (!validator.isValid(title)) return res.status(400).send({ status: false, message: "title is required" })
       
        const checkTitle = await bookModel.findOne({ title: title });
       
        if (checkTitle) return res.status(400).send({ status: false, message: "title is already present" });

        if (!validator.isValid(excerpt)) return res.status(400).send({ status: false, message: "excerpt is required" })
       
        if (!validator.isValid(userId)) return res.status(400).send({ status: false, message: "userId is required" })
        
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "please enter valid userId" })
        
        const userid = await userModel.findById(req.body.userId);
        
        if (!userid) return res.status(400).send({ status: false, message: "no such userId present" })

        if (!validator.isValid(ISBN)) return res.status(400).send({ status: false, message: "ISBN number required" })

        const checkISBN = await bookModel.findOne({ ISBN: ISBN });

        if (checkISBN) return res.status(400).send({ status: false, message: "ISBN already present" })

        if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN" })

        if (!validator.isValid(category)) return res.status(400).send({ status: false, message: "category is required" })

        if (!validator.isValid(subcategory)) return res.status(400).send({ status: false, message: "subcategory is required must be array of string" })

        if (!releasedAt) return res.status(400).send({ status: false, message: "releasedAt is required" })

        if (!/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(releasedAt))
            return res.status(400).send({ status: false, message: "Enter a valid date with the format (YYYY-MM-DD)." });
            req.body.bookCover = uploadedFileURL
        const bookData = await bookModel.create(req.body);

        return res.status(201).send({ status: true, message: 'Success', data: bookData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }
}

// GET BOOK DETAIL BY PATH PARAMS
const getBook = async function (req, res) {
    try {
        const filterByQuery = { isDeleted: false }
        const { userId, category, subcategory } = req.query;

        if (userId || userId == "") {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).send({ status: false, message: "please give valid userId" })
            } else filterByQuery["userId"] = userId;
        }
        if (category || category == "") {
            if (!validator.isValid(category)) {
                return res.status(400).send({ status: false, message: "please enter valid category" })
            }
            filterByQuery["category"] = category;
        }
        if (subcategory || subcategory == "") {
            if (!validator.isValid(subcategory)) {
                return res.status(400).send({ status: false, message: "please enter valid category" })
            }
            const subcategoryArr = subcategory.trim().split(",").map(subcategory => subcategory.trim())
            filterByQuery["subcategory"] = subcategoryArr;
        }

        const books = await bookModel.find({ filterByQuery, isDeleted: false }).select({ title: 1, excerpt: 1, userID: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

        if (books.length == 0) return res.status(404).send({ status: false, message: "books not found" });

        return res.status(200).send({ status: true, message: "Books list", data: books })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const getBookbyparams = async (req, res) => {
    try {
        let bookId = req.params.bookId

        if (!mongoose.Types.ObjectId.isValid(bookId))
            return res.status(400).send({ status: false, message: " bookId is invalid" })

        let bookDetails = await bookModel.findOne({ _id: bookId, isDeleted: false }, { __v: 0 }).lean();

        if (!bookDetails)
            return res.status(404).send({ status: false, message: "there is no book document pl.insert valid bookId" })

        const reviewsData = await reviewModel.find({ bookId: bookDetails["_id"] }, { isDeleted: 0, __v: 0 })

        bookDetails["reviewsData"] = reviewsData;

        return res.status(200).send({ status: true, message: "Books list", data: bookDetails })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//UPDATE BOOK



const updateBook = async function (req, res) {
    try {
        let  bookId = req.params.bookId;
            // Validating the bookId
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return res.status(400).send({ status: false, message: "bookId is invalid " })
            }
            // Checking if bookId exist or not
            const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
            if (!book) {
                return res.status(404).send({ status: false, message: "This bookId does not exist" })
            }
    
            // Validating  that req body must not be empty       
            if (Object.keys(req.body).length == 0) {
                return res.status(400).send(
                    { status: false, message: "There is no data  in body Please provide some details" });
            }
    
            const { title, excerpt, releasedAt, ISBN } = req.body
            // Validating the various data to be updated in document
            if (title || title == "") {
    
                if (!validator.isValid(title)) {
                    return res.status(400).send({ status: false, message: "please provide title in valid form" })
                }
                checkTitle = await bookModel.findOne({ title });
                if (checkTitle) {
                    return res.status(400).send({ status: false, message: "title already present" });
                }
            }
            if (ISBN || ISBN == "") {
                if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) {
                    return res.status(400).send({ status: false, message: "Invalid ISBN" })
                }
                checkISBN = await bookModel.findOne({ ISBN });
                if (checkISBN) {
                    return res.status(400).send({ status: false, message: "ISBN number already present" });
                }
            }
            if (excerpt || excerpt == "") {
                if (!validator.isValid(excerpt)) {
                    return res.status(400).send({ status: false, message: "please provide excerpt in valid form" })
                }
            }
            if (releasedAt || releasedAt == "") {
                if (!validator.isValid(releasedAt)) {
                    return res.status(400).send({ status: false, message: "please provide release date in valid form" })
                }
            }
    
            if (!/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(releasedAt))
                return res.status(400).send({ status: false, message: "Enter a valid date with the format (YYYY-MM-DD)."});
    
            //updating the data
            const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId },
                { title: title, excerpt: excerpt, ISBN: ISBN, releasedAt: releasedAt },
                { new: true });
            if (updatedBook) {
               return res.status(200).send({ status: true, message: "data updated successfully", data: updatedBook })
            }
            else return res.status(404).send({ status: false, message: " no such book found" })
    
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
        
}

// DELETE BY BOOKID
const deletebookbyid = async (req, res) => {
    try {
        const bookId = req.params.bookId;

        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: 'Please enter valid bookId' })

        let book = await bookModel.findById(bookId)

        if (!book || book.isDeleted === true) return res.status(404).send({ status: false, message: "book is not found" })

        await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return res.status(200).send({ status: true, message: "successfuly Deleted", });

    } catch (error) { return res.status(500).send({ status: false, message: error.message }) }
}


module.exports = { createBooks, getBook, getBookbyparams, updateBook, deletebookbyid }




