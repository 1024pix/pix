export default function (schema, request) {
  const shortId = request.params.shortId;
  return schema.modules.findBy({ shortId });
}
