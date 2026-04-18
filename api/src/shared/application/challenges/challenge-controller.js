import * as challengeToPlayApi from '../../../evaluation/application/api/challenge-to-play-api.js';

const get = async function (request, h, dependencies = { challengeToPlayApi }) {
  const challengeToPlay = await dependencies.challengeToPlayApi.get(request.params.id);
  return dependencies.challengeToPlayApi.serialize(challengeToPlay);
};

const challengeController = { get };

export { challengeController };
