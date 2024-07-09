const express = require('express');
const db = require('../Libraries/Database');
const router = express.Router();

router.all("/", async (req, res) => {
    await db.query(`
        DROP TABLE IF EXISTS users;
        CREATE TABLE users (
            userId SERIAL PRIMARY KEY,  
            firstName VARCHAR(255) NOT NULL,  
            lastName VARCHAR(255) NOT NULL,   
            email VARCHAR(255) NOT NULL UNIQUE,  
            password VARCHAR(255) NOT NULL,  
            phone VARCHAR(50)                
            );

        `)
        res.status(201).json({
            "message":"migrated successfully"
        })
})
module.exports = router;