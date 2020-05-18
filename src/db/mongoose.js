const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_PATH,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex: true
})