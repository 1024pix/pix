const infoChallengeRepository = require('../../infrastructure/repositories/godmode/info-challenge-repository');
const infoChallengeSerializer = require('../../infrastructure/serializers/jsonapi/godmode/info-challenge-serializer');

module.exports = {
  async getInfoChallenge(request) {
    try {
      const challengeId = request.params.id;
      const infoChallenge = await infoChallengeRepository.get(challengeId);
      return infoChallengeSerializer.serialize(infoChallenge);
    } catch (err) {
      console.log(err);
    }
  },
};
