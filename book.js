const express = require('express')
const router = express.Router()

router.get('/', (req, res)=>{
	res.send('Book home page')
})

router.get('/about', (req, res)=>{
	res.send('About bookes')
})

module.exports = router