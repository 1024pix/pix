const userRepository = require('../repositories/users');
const userSerializer = require('../serializers/users');

module.exports = {

  findUsers(req, res) {
    const users = userRepository.find();
    const response = userSerializer.serialize(users);
    return res.send(response);
  },

  getUser(req, res) {
    const userId = req.params['user_id'];
    const user = userRepository.get(userId);
    const response = userSerializer.serialize(user);
    return res.send(response);
  },

  createUser(req, res) {
    const user = {
      firstName: req.body['first-name'],
      lastName: req.body['last-name'],
      email: req.body['email']
    };
    const entity = userRepository.create(user);
    const response = userSerializer.serialize(entity);
    return res.send(response);
  }

};
