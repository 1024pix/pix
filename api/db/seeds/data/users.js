const encrypt = require('../../../lib/domain/services/encryption-service');

function hashPassword (password) {
  return encrypt
    .hashPassword(password)
    .then((hash) => {
      return hash;
    });
}

function createUser(id, firstName, lastName, email, password) {
  return hashPassword(password)
    .then(encryptedPassword => {
      return {
        id,
        firstName,
        lastName,
        email,
        password: encryptedPassword
      };
    });
}

module.exports = [
  createUser(1,'Pix','Aile', 'userpix1@example.net','pix123'),
  createUser(2,'Daenerys','Targaryen', 'pro@example.net','pix123'),
  createUser(3,'Tyrion','Lannister', 'sup@example.net','pix123'),
  createUser(4,'John','Snow', 'sco@example.net','pix123'),
  createUser(5,'Pix','Master', 'pixmaster@example.net','pix123'),
];
