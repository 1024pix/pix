function updateBadgeCriterion(schema, request) {
  try {
    const badgeCriterionId = request.params.id;
    const params = JSON.parse(request.requestBody);

    const badgeCriterion = schema.badgeCriteria.find(badgeCriterionId);
    badgeCriterion.update(params.data.attributes);

    return badgeCriterion;
  } catch (error) {
    console.error(error);
  }
}

export { updateBadgeCriterion };
