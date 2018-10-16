export default function(schema, request) {
  const code = request.queryParams['filter[code]'];

  const foundCampaigns = schema.campaigns.where({ code });

  if (foundCampaigns.length > 0) {
    return foundCampaigns;
  }
  // FIXME REST API should return an empty array when no ressources were found
  return new Response(404);
}
