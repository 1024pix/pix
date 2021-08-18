function getCampaignByCode({
  code,
  campaignToJoinRepository,
}) {
  return campaignToJoinRepository.getByCode(code);
};

module.exports = {
  perform: getCampaignByCode,
  useTransaction: false,
}
