export default function (schema, { params: { id } }) {
  return schema.certificationCandidates.find(id);
}
