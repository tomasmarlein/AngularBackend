const express = require('express')
const port = process.env.PORT
const userRouter = require('./routers/user')
const pollRouter = require('./routers/poll')
require('./db/db')

const app = express()
var cors = require('cors')


app.options('*', cors()) // include before other routes 
app.use(cors())
app.use(express.json())
app.use('/api', userRouter)
app.use('/api', pollRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})