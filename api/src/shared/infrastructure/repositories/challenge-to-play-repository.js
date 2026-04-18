import { NotFoundError } from '../../domain/errors.js';
import { ChallengeToPlay } from '../../domain/models/ChallengeToPlay.js';
import { httpAgent } from '../http-agent.js';
import * as challengeRepository from './challenge-repository.js';

export async function get(challengeId) {
  const challenge = await challengeRepository.get_proxy(challengeId);
  const { webComponentProps, webComponentTagName } = await loadWebComponentInfo(challenge);
  return new ChallengeToPlay(challenge, webComponentTagName, webComponentProps);
}

async function loadWebComponentInfo(challenge) {
  if (challenge.embedUrl == null || !challenge.embedUrl.endsWith('.json'))
    return {
      webComponentTagName: null,
      webComponentProps: null,
    };

  const response = await httpAgent.get({ url: challenge.embedUrl });
  if (!response.isSuccessful) {
    throw new NotFoundError(
      `Embed webcomponent config with URL ${challenge.embedUrl} in challenge ${challenge.id} not found`,
    );
  }

  return {
    webComponentTagName: response.data.name,
    webComponentProps: response.data.props,
  };
}
