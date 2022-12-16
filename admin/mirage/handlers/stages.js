function createStage(schema, request) {
  const params = JSON.parse(request.requestBody);
  return schema.stages.create(params.data.attributes);
}

export { createStage };
