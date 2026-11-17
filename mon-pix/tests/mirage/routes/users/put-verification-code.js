export default function (schema, request) {
  const payload = JSON.parse(request.requestBody);
  const action = payload?.data?.attributes?.action;
  if (action !== undefined && action !== 'update-email' && action !== 'add-email') {
    return new Response(422, {}, { errors: [{ status: '422' }] });
  }
  return new Response(204);
}
