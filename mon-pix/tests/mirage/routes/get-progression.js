export default function (schema, request) {
  const { id } = request.params;

  let progression = schema.progressions.find(id);

  if (!progression) {
    progression = schema.scorecards.create({});
  }

  return progression;
}
