export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const moduleId = params.data.attributes['module-id'];

  const passage = schema.create('passage', { moduleId });
  const elementAnswers = schema.elementAnswers.where({ passage });
  passage.elementAnswers = elementAnswers;

  return passage;
}
