export default function (schema, request) {
  const slug = request.params.slug;
  return schema.modules.find(slug);
}
