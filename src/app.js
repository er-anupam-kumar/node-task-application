const express = require('express')
//Get Routers
const userRouters = require('./routers/user')
const taskRouters = require('./routers/task')

//Configure express
const app     = express()

app.use(express.json())

//Register Routes
app.use(userRouters)
app.use(taskRouters)


module.exports = app


