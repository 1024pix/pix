import _ from 'lodash';
import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const assessmentId = request.params.assessmentId;
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
    case 'SMART_PLACEMENT':
      challengeIdStartsWith = 'recSMARPLA';
      break;
  }
  const answers = schema.answers.where({ assessmentId: assessment.id }).models;
  const answeredChallengeIds = _.map(answers, 'challengeId');
  const allChallenges = schema.challenges.where((challenge) => {
    return challenge.id.startsWith(challengeIdStartsWith);
  });
  const allChallengeIds  = _.map(allChallenges.models, 'id');

  const nextChallengeId = _(allChallengeIds).difference(answeredChallengeIds).first();
  return nextChallengeId ? schema.challenges.find(nextChallengeId) : new Response(200, {}, { data: null });
}
