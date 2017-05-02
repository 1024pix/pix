const Boom = require('boom');
const Follower = require('../../domain/models/data/follower');
const EmailValidator = require('../../domain/services/email-validator');
const followerSerializer = require('../../infrastructure/serializers/jsonapi/follower-serializer');

const mailService = require('../../domain/services/mail-service');

function _assertFollowerNotExist(follower) {
  return new Promise((resolve, reject) => {
    if (follower) {
      return reject(Boom.conflict('Follower already exist'));
    }
    return resolve();
  });
}

function _saveFollower(email) {
  return new Promise((resolve, reject) => {
    new Follower({ email: email })
      .save()
      .then((emailSaved) => {
        return resolve(emailSaved);
      })
      .catch((err) => {
        return reject(Boom.badImplementation(err));
      });
  });
}

module.exports = {
  save(request, reply) {
    const followerObject = followerSerializer.deserialize(request.payload);
    const email = followerObject.get('email').trim();

    if (!EmailValidator.emailIsValid(email)) {
      return reply(Boom.badRequest('Bad format of email provided'));
    }

    return Follower
      .where({ email })
      .fetch()
      .then(_assertFollowerNotExist)
      .then(() => _saveFollower(email))
      .then((follower) => {

        mailService.sendWelcomeEmail(email);
        reply(followerSerializer.serialize(follower)).code(201);

      })
      .catch((err) => reply(err));
  }
};

