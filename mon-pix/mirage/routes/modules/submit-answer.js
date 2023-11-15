export default function (schema, request) {
  const elementId = request.params.elementId;
  const correction = schema.correctionResponses.find(elementId);
  return schema.elementAnswers.create({ correction });
}
