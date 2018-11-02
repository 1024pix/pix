import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const code = request.queryParams['filter[code]'];

  if (code) {
    const campaigns = schema.campaigns.where({ code });
    if (campaigns.length === 0) {
      return new Response(404);
    }
    return campaigns;
  }
  return schema.campaigns.all();

}
