import map from 'lodash/map';
import first from 'lodash/first';
import difference from 'lodash/difference';
import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const assessmentId = request.params.id;
  const assessment = schema.assessments.find(assessmentId);
  let challengeIdStartsWith;
  switch (assessment.type) {
    case 'DEMO':
      challengeIdStartsWith = 'recDEMO';
      break;
    case 'CERTIFICATION':
      challengeIdStartsWith = 'recCERTIF';
      break;
    case 'COMPETENCE_EVALUATION':
      challengeIdStartsWith = 'recCOMPEVAL';
      break;
    case 'CAMPAIGN':
      challengeIdStartsWith = 'recSMARPLA';
      break;
  }
  const answers = schema.answers.where({ assessmentId: assessment.id }).models;
  const answeredChallengeIds = map(answers, 'challengeId');
  const allChallenges = schema.challenges.where((challenge) => {
    return challenge.id.startsWith(challengeIdStartsWith);
  });
  const allChallengeIds = map(allChallenges.models, 'id');

  const nextChallengeId = first(difference(allChallengeIds, answeredChallengeIds));
  return nextChallengeId ? schema.challenges.find(nextChallengeId) : new Response(200, {}, { data: null });
}
