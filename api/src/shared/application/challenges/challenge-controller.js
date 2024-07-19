import { httpAgent } from '../../../../lib/infrastructure/http/http-agent.js';
import { NotFoundError } from '../../domain/errors.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';

const get = async function (request, h, dependencies = { challengeRepository, challengeSerializer }) {
  const challenge = await dependencies.challengeRepository.get(request.params.id);
  if (challenge.hasEmbedFragment()) {
    const embedFragmentResponse = await httpAgent.get({ url: challenge.embedUrl });
    if (!embedFragmentResponse.isSuccessful) {
      throw new NotFoundError(`Embed fragment with URL ${challenge.embedUrl} in challenge ${challenge.id} not found`);
    }

    challenge.embedFragment = embedFragmentResponse.data;
  }

  return dependencies.challengeSerializer.serialize(challenge);
};

const challengeController = { get };

export { challengeController };
