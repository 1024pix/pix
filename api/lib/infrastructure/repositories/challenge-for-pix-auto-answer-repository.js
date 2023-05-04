import { ChallengeForPixAutoAnswer } from '../../domain/read-models/ChallengeForPixAutoAnswer.js';
import { challengeDatasource } from '../datasources/learning-content/challenge-datasource.js';

const get = async function (challengeId) {
  const challenge = await challengeDatasource.get(challengeId);
  return new ChallengeForPixAutoAnswer({
    id: challenge.id,
    solution: challenge.solution,
    type: challenge.type,
    autoReply: challenge.autoReply,
  });
};

export { get };
