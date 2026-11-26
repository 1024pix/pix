function getOrganizationCreditsLots(schema, request) {
  const organizationId = request.params.id;
  const result = schema.creditsLots.where({ organizationId });
  return result;
}

function createOrganizationCreditsLots(schema, request) {
  const params = JSON.parse(request.requestBody);
  return schema.create('credits-lot', { id: 12, reference: params.reference, organizationId: request.params.id });
}

export { createOrganizationCreditsLots, getOrganizationCreditsLots };
