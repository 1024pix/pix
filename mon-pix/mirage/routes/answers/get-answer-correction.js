export default function(schema, request) {
  return schema.answers.find(request.params.id).correction;
}
