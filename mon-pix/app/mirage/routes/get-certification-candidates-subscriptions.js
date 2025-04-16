export default function (schema, request) {
  const certificationCandidateId = request.params.id;
  return schema.certificationCandidateSubscriptions.find(certificationCandidateId);
}
