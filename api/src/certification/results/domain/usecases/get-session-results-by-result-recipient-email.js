const getSessionResultsByResultRecipientEmail = async function ({
  sessionId,
  resultRecipientEmail,
  certificationResultRepository,
  resultRecipientRepository,
}) {
  const resultRecipient = await resultRecipientRepository.get({ sessionId, resultRecipientEmail });

  return await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: resultRecipient.candidateIds,
  });
};

export { getSessionResultsByResultRecipientEmail };
