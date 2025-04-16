export default function (schema, { params: { id } }) {
  return schema.certifications.find(id);
}
