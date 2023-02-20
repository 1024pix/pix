import challengeRepository from '../../infrastructure/repositories/challenge-repository';
import challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer';

export default {
  get(request) {
    return challengeRepository.get(request.params.id).then((challenge) => challengeSerializer.serialize(challenge));
  },
};
