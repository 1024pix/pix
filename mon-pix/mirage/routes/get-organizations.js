export default function(schema, request) {
  const code = request.queryParams['code'];

  if (code) {
    return schema.organizations.where({ code });
  }

  return schema.organizations.all();
}
