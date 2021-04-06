function getBadge(schema, request) {
  const id = request.params.id;
  return schema.badges.find(id);
}

export { getBadge };
