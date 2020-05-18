const express = require('express')

//Get Routers
const userRouters = require('./routers/user')
const taskRouters = require('./routers/task')

//Configure express
const app     = express()
const port    = process.env.PORT

app.use(express.json())

//Register Routes
app.use(userRouters)
app.use(taskRouters)

app.listen(port, () => {
 console.log(`Server is up and running on port:${port}`)
})



