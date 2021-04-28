function getBadge(schema, request) {
  const id = request.params.id;
  request.queryParams.include = [
    'badgeCriteria.partnerCompetences',
    'badgeCriteria.partnerCompetences.skills',
    'badgeCriteria.partnerCompetences.skills.tube',
  ].join(',');
  return schema.badges.find(id);
}

export { getBadge };
