export async function getChallenge({ challengeId, assessmentId = 1, challengeRepository, randomDataService }) {
  const challenge = await challengeRepository.get(challengeId);

  if (!challenge.hasVariables) return challenge;

  randomDataService.generateChallengeVariables({ challenge, assessmentId });

  return challenge;
}
