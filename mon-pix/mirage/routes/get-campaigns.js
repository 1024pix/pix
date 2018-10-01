export default function(schema, request) {
  if(request.queryParams['filter[code]'] === 'codecampagnepix') {
    return schema.campaigns.all();
  }
}
