export default function(schema, request) {
  if(request.queryParams['filter[code]'] === 'AZERTY1') {
    return schema.campaigns.find(['1']);
  }
  if(request.queryParams['filter[code]'] === 'AZERTY2') {
    return schema.campaigns.find(['2']);
  }
  return schema.campaigns.find(0);
}
