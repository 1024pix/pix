import _ from 'lodash';

import { domainBuilder } from '../../../test-helper.js';

export const generateChallengeList = ({ length }) =>
  _.range(0, length).map((index) =>
    domainBuilder.shared.buildBaseChallenge({
      id: `chall${index}`,
    }),
  );

export const generateCalibratedChallengeList = ({ length }) =>
  _.range(0, length).map((index) =>
    domainBuilder.certification.evaluation.buildCalibratedChallenge({
      id: `chall${index}`,
    }),
  );

export const generateAnswersForChallenges = ({ challenges }) =>
  challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      challengeId,
    }),
  );
