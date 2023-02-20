import ChallengeForPixAutoAnswer from '../../domain/read-models/ChallengeForPixAutoAnswer';
import challengeDatasource from '../datasources/learning-content/challenge-datasource';

export default {
  async get(challengeId) {
    const challenge = await challengeDatasource.get(challengeId);
    return new ChallengeForPixAutoAnswer({
      id: challenge.id,
      solution: challenge.solution,
      type: challenge.type,
      autoReply: challenge.autoReply,
    });
  },
};
