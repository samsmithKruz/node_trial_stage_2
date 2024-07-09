require('dotenv').config();
const jwt = require('../Libraries/Jwt')
const db = require('../Libraries/Database')

module.exports = async (req, res, next) => {
    let token = req.headers.authorization || req.headers.Authorization;
    token = token.split(" ")[1]
    try {
        let { userId } = await jwt.verifyToken(token)
        const user = await db.query(`SELECT email from users where userid =$1`, [userId])
        if (user.rowCount > 0) {
            req.userId = userId
            return next()
        }
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }

}