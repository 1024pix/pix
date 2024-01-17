export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const elementId = params.data.attributes['element-id'];

  const correction = schema.correctionResponses.find(elementId);
  return schema.elementAnswers.create({ correction });
}
