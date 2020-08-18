const path = require('path')
const express = require('express')
const app = express()
const publicdir = path.join(__dirname, '../public')
const User = require('./models/users.js')
const userRouter = require('./routers/userRouter')
require('./mongodb/mongoose.js')
const salesRouter = require('./routers/salesRouter')
const dotenv = require('dotenv')
dotenv.config()
const port =process.env.PORT



app.use(express.static(publicdir))
app.use(express.json())
app.use(userRouter)
app.use(salesRouter)

app.listen(port, ()=>{
    console.log('Server is listening on port'+port)
})

