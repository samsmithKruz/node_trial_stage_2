const express = require('express');
const router = express.Router();
const db = require('../Libraries/Database')
router.get("/users/:id", async (req, res) => {
    const { id } = req.params
    const userId = req.userId

    let record = await db.query(`
        SELECT 
                users.userid::VARCHAR,
                users.firstname,
                users.lastname,
                users.email,
                users.phone
            FROM 
                users
            LEFT JOIN 
                organisation_user ON organisation_user.userid::VARCHAR = users.userid::VARCHAR
            LEFT JOIN 
                organisation ON organisation.orgid::VARCHAR = organisation_user.orgid::VARCHAR
            WHERE
                users.userid::VARCHAR = $1 and organisation_user.orgid::VARCHAR = $2
        `, [id, userId]);

    if (record.rowCount > 0) {
        let { userid, firstname, email, lastname, phone } = record.rows[0];
        return res.status(200).json(
            {
                "status": "success",
                "message": "Fetched successful",
                "data": {
                    "userId": userid,
                    "firstName": firstname,
                    "lastName": lastname,
                    "email": email,
                    "phone": phone,
                }
            }
        )
    } else {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }
})
router.get("/organisations", async (req, res) => {
    const userId = req.userId
    let record = await db.query(`
        SELECT 
                organisation.orgid::VARCHAR,
                organisation.name::VARCHAR,
                organisation.description::VARCHAR
            FROM organisation
            LEFT JOIN organisation_user ON
                organisation_user.orgid::VARCHAR = organisation.orgid::VARCHAR
            WHERE 
                organisation_user.userid::VARCHAR = $1
        `, [userId]);

    if (record.rowCount > 0) {
        record.rows = record.rows.map(e => {
            e.orgId = e.orgid;
            delete e.orgid
            return e
        })
        return res.status(200).json(
            {
                "status": "success",
                "message": "Fetched successful",
                "data": {
                    "organisations": record.rows
                }

            }
        )
    } else {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }
})
router.post("/organisations", async (req, res) => {
    const userId = req.userId
    const { name, description } = req.body
    if (!name) {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }
    let orgid = +userId;
    while (true) {
        orgid = orgid + Math.floor(Math.random() * 10)
        let _ = await db.query(`SELECT orgid from organisation where orgid=$1`, [orgid])
        if (_.rowCount == 0) {
            break;
        }
    }
    let record = await db.query(`
        INSERT INTO organisation(orgid,name,description,owner)
        values($1,$2,$3,$4)
        `, [
        orgid,
        name,
        description || "",
        userId
    ]);

    if (record.rowCount > 0) {
        await db.query(`
            INSERT INTO organisation_user(orgid,userid)
            values($1,$2)
            `, [
            orgid,
            userId
        ]);
        return res.status(201).json(
            {
                "status": "success",
                "message": "Organisation created successfully",
                "data": {
                    "orgId": "" + orgid,
                    "name": name,
                    "description": description,
                }

            }
        )
    } else {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }
})
router.post("/organisations/:orgId/users", async (req, res) => {
    const { orgId } = req.params
    const { userId } = req.body

    if (!userId) {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }

    let record = await db.query(`
        INSERT INTO organisation_user(orgid,userid)
        values($1,$2)
        `, [orgId, userId]);

    if (record.rowCount == 0) {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }
    return res.status(200).json({
        "status": "success",
        "message": "User added to organisation successfully"
    })

})
router.get("/organisations/:orgId", async (req, res) => {
    // const userId = req.userId
    const { orgId } = req.params

    let record = await db.query(`
        SELECT * from organisation where orgid::VARCHAR=$1
        `, [orgId])


    if (record.rowCount > 0) {
        return res.status(200).json(
            {
                "status": "success",
                "message": "Fetched successful",
                "data": record.rows[0]

            }
        )
    } else {
        return res.status(400).json({
            "status": "Bad Request",
            "message": "Client error",
            "statusCode": 400
        })
    }

})
module.exports = router;