module.exports = async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  answerRepository,
  challengeRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const answers = await answerRepository.findByAssessment(assessmentId);
  const answerLength = answers.length;
  return await challengeRepository.getForPix1D({
    missionId,
    activityLevel: 'didacticiel',
    answerLength,
  });
};
