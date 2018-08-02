import _ from 'mon-pix/utils/lodash-custom';
import refAssessment from '../data/assessments/ref-assessment';
import refAssessmentCampaign from '../data/assessments/ref-assessment-placement';
import refAssessmentTimedChallenges from '../data/assessments/ref-assessment-timed-challenges';

export default function(schema, request) {

  const assessmentId = request.params.id;

  const allAssessments = [
    refAssessment,
    refAssessmentCampaign,
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
