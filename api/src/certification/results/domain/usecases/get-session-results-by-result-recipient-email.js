export async function getSessionResultsByResultRecipientEmail({
  sessionId,
  resultRecipientEmail,
  certificationResultRepository,
  resultRecipientRepository,
}) {
  const resultRecipient = await resultRecipientRepository.get({ sessionId, resultRecipientEmail });

  return await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: resultRecipient.candidateIds,
  });
}
