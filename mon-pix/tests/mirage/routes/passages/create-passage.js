export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const moduleId = params.data.attributes['module-id'];

  return schema.create('passage', { moduleId });
}
