const express = require('express');
const apiRoute = require('./routes/api')
const authRoute = require('./routes/auth')
const loggedIn = require('./middleware/auth_middleware')
const migrateRoute = require('./routes/migrate')
require('dotenv').config();


const app = express();
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());

// Use routes
app.use('/api', loggedIn, apiRoute);
app.use('/auth', authRoute);
app.use('/migrate', migrateRoute);

app.get("/", (req, res) => {
    res.status(200).json({
        "status": 200,
        "message": "All ok"
    });
})

app.use((req, res, next) => {
    res.status(404).json({
        "statusCode": 404,
        "message": "Endpoint not found"
    });
})
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: err.stack,
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});