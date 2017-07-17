import _ from 'pix-live/utils/lodash-custom';
import refAssessment from '../data/assessments/ref-assessment';
import refAssessmentTimedChallenges from '../data/assessments/ref-assessment-timed-challenges';

export default function(schema, request) {

  const allAssessments = [
    refAssessment,
    refAssessmentTimedChallenges
  ];

  const assessments = _.map(allAssessments, function(oneAssessment) {
    return { id: oneAssessment.data.id, obj: oneAssessment };
  });

  const assessment = _.find(assessments, { id: request.params.id });

  if (assessment) {
    return assessment.obj;
  }else {
    throw new Error('The assessment you required in the fake server does not exist ' + request.params.id);
  }

}
