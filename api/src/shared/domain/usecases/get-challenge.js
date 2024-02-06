export async function getChallenge({ challengeId, challengeRepository }) {
  return challengeRepository.get(challengeId);
}
