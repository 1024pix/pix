export default function (schema, request) {
  const certificationCandidateId = request.params.certificationCandidateId;
  const certificationCandidate = schema.certificationCandidates.find(certificationCandidateId);
  certificationCandidate.update({ hasSeenCertificationInstructions: true });

  return certificationCandidate;
}
