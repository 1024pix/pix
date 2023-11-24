import _ from 'lodash';
import { domainBuilder } from '../../../test-helper.js';

export const generateChallengeList = ({ length }) =>
  _.range(0, length).map((index) =>
    domainBuilder.buildChallenge({
      id: `chall${index}`,
    }),
  );

export const generateAnswersForChallenges = ({ challenges }) =>
  challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      challengeId,
    }),
  );
