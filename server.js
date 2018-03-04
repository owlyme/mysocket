// import "babel-polyfill";
import express from 'express'
import chatroom from './chat/index'

const app = express()

const server = app.listen(4000,() =>{
	console.log('listening on port 4000')
})
app.use(express.static('public'))

chatroom(server)



