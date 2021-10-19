function getBadge(schema, request) {
  const id = request.params.id;
  request.queryParams.include = [
    'badgeCriteria.skillSets',
    'badgeCriteria.skillSets.skills',
    'badgeCriteria.skillSets.skills.tube',
  ].join(',');
  return schema.badges.find(id);
}

export { getBadge };
