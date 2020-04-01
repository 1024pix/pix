import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const code = request.queryParams['filter[code]'];
  if (!code) {
    return new Response(500);
  }

  const campaigns = schema.campaigns.where((campaign) => {
    return campaign.code.toLowerCase() === code.toLowerCase();
  });
  if (campaigns.length === 0) {
    return new Response(404);
  }
  return campaigns;
}
