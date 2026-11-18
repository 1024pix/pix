export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const events = params.data.attributes['events'];

  return schema.create('passage-events-collection', { events });
}
