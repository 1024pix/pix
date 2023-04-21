module.exports = async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  answerRepository,
  challengePix1dRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const answers = await answerRepository.findByAssessment(assessmentId);
  const answerLength = answers.length;
  return await challengePix1dRepository.get({
    missionId,
    activityLevel: 'didacticiel',
    answerLength,
  });
};
