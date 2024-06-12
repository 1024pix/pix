function findPaginatedFilteredCampaignParticipations(schema) {
  const campaignParticipations = schema.campaignParticipations.all().models;
  const json = this.serialize(
    { modelName: 'campaign-participation', models: campaignParticipations },
    'campaign-participation',
  );
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

export { findPaginatedFilteredCampaignParticipations };
