module.exports = function getCampaignByCode({
  code,
  campaignToJoinRepository,
}) {
  return campaignToJoinRepository.getByCode(code);
};
