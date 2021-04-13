function getBadge(schema, request) {
  const id = request.params.id;
  request.queryParams.include = 'badgeCriteria.partnerCompetences';
  return schema.badges.find(id);
}

export { getBadge };
