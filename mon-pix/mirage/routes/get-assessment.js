import _ from 'mon-pix/utils/lodash-custom';
import refAssessment from '../data/assessments/ref-assessment';
import refAssessmentCampaign from '../data/assessments/ref-assessment-placement';
import refAssessmentTimedChallenges from '../data/assessments/ref-assessment-timed-challenges';
import refAssessmentNoAnswer from '../data/assessments/ref-assessment-no-answer';

export default function(schema, request) {

  const assessmentId = request.params.id;

  const allAssessments = [
    refAssessment,
    refAssessmentCampaign,
    refAssessmentTimedChallenges,
    refAssessmentNoAnswer,
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
