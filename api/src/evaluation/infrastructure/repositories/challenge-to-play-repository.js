import { NotFoundError } from '../../../shared/domain/errors.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { ChallengeToPlay } from '../../domain/models/ChallengeToPlay.js';

export async function get(challengeId) {
  const lcmsChallenge = await challengeRepository.getChallengeDto(challengeId);
  const { webComponentProps, webComponentTagName } = await loadWebComponentInfo(lcmsChallenge);
  return new ChallengeToPlay(lcmsChallenge, webComponentTagName, webComponentProps);
}

async function loadWebComponentInfo(lcmsChallenge) {
  if (lcmsChallenge.embedUrl == null || !lcmsChallenge.embedUrl.endsWith('.json'))
    return {
      webComponentTagName: null,
      webComponentProps: null,
    };

  const response = await httpAgent.get({ url: lcmsChallenge.embedUrl });
  if (!response.isSuccessful) {
    throw new NotFoundError(
      `Embed webcomponent config with URL ${lcmsChallenge.embedUrl} in challenge ${lcmsChallenge.id} not found`,
    );
  }

  return {
    webComponentTagName: response.data.name,
    webComponentProps: response.data.props,
  };
}
