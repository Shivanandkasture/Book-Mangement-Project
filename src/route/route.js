const express = require('express')
const router = express.Router()
const {createBooks,getBook,getBookbyparams ,updateBook ,deletebookbyid }=require('../controller/bookController')
const {createReview,updateReview,DeleteBookReview } = require('../controller/reviewController')
const {registerUser,login}=require('../controller/userController')

const {authentication,authorisation} = require('../middleware/auth')
//============================user api================================//
router.post('/register',registerUser)     
router.post('/login',login)               
//============================book api================================//
router.post('/books', createBooks)       
router.get('/books',authentication,getBook)                  
router.get('/books/:bookId',authentication,getBookbyparams)     
router.put('/books/:bookId',authentication,authorisation ,updateBook)          
router.delete('/books/:bookId',authentication,authorisation,deletebookbyid)         

//============================review api================================//
router.post('/books/:bookId/review',createReview)     
router.put('/books/:bookId/review/:reviewId',updateReview)      
router.delete('/books/:bookId/review/:reviewId',DeleteBookReview)     





// BAD URL
router.all("*", function (req, res) {
    res.status(404).send({status: false,msg: "BAD URL NOT FOUND"})
})


module.exports = router