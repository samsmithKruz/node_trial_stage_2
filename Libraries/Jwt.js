const jwt = require('jsonwebtoken');
require('dotenv').config();

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN; // default to 1 hour
  }

  generateToken(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, this.secret, { expiresIn: this.expiresIn }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }
}

module.exports = new JwtService;
