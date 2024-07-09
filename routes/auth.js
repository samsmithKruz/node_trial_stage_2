const express = require('express');
const router = express.Router();
const db = require('../Libraries/Database')
const jwt = require('../Libraries/Jwt')
const crypto = require('crypto');

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body
    let errors = [];

    if (!firstName || firstName.length == 0) {
        errors.push({
            "field": "firstName",
            "message": "First name is invalid"
        })
    }
    if (!lastName || lastName.length == 0) {
        errors.push({
            "field": "lastName",
            "message": "Last name is invalid"
        })
    }
    if (!password || password.length == 0) {
        errors.push({
            "field": "password",
            "message": "Password is invalid"
        })
    }
    if (!email || email.length == 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({
            "field": "email",
            "message": "Email is invalid"
        })
    }

    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    // Hash password
    let hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    return await db.query(`
        INSERT INTO users (firstName, lastName, email, password, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING userId
        `, [
        firstName,
        lastName,
        email,
        hashedPassword,
        phone || ""
    ])
        .then(async () => {
            const userid = await (await db.query(`SELECT userId as userid from users where email=$1`, [email])).rows[0]


            await db.query(`
                INSERT INTO organisation(orgid,name,owner,description) 
                values($1,$2,$1,$3)`, [
                userid.userid,
                `${firstName}'s Organisation`,
                ""
            ]);
            await db.query(`
                INSERT INTO organisation_user(orgid,userid) 
                values($1,$1)`, [
                userid.userid
            ]);



            const token = await jwt.generateToken({
                userId: userid.userid
            })

            return res.status(201).json({
                "status": "success",
                "message": "Registration successful",
                "data": {
                    "accessToken": token,
                    "user": {
                        "userId": "" + userid.userid,
                        "firstName": firstName,
                        "lastName": lastName,
                        "email": email,
                        "phone": phone || "",
                    }
                }
            })
        }).catch(error => {
            console.log(error)
            return res.status(400).json(
                {
                    "status": "Bad request",
                    "message": "Registration unsuccessful",
                    "statusCode": 400
                }
            )
        })
})
router.post("/login", async (req, res) => {
    const { email, password } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length == 0) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Authentication failed",
            "statusCode": 401
        })
    }

    // Hash password
    let hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    const user = await db.query(`SELECT * from users where email =$1 and password =$2`, [
        email,
        hashedPassword
    ])
    if (user.rowCount > 0) {
        let { userid, firstname, lastname, phone } = user.rows[0];
        return res.status(200).json(
            {
                "status": "success",
                "message": "Login successful",
                "data": {
                    "accessToken": await jwt.generateToken({
                        userId: userid
                    }),
                    "user": {
                        "userId": "" + userid,
                        "firstName": firstname,
                        "lastName": lastname,
                        "email": email,
                        "phone": phone,
                    }
                }
            }
        )
    } else {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Authentication failed",
            "statusCode": 401
        })
    }

})
module.exports = router;