import _ from 'pix-live/utils/lodash-custom';
import refAssessment from '../data/assessments/ref-assessment';
import refAssessmentTimedChallenges from '../data/assessments/ref-assessment-timed-challenges';

export default function(schema, request) {

  const assessmentId = request.params.id;

  const allAssessments = [
    refAssessment,
    refAssessmentTimedChallenges
  ];

  const assessments = _.map(allAssessments, function(oneAssessment) {
    return { id: oneAssessment.data.id, obj: oneAssessment };
  });

  const assessment = _.find(assessments, { id: assessmentId });

  if (assessment) {
    return assessment.obj;
  }
  return schema.assessments.find(assessmentId);
}
