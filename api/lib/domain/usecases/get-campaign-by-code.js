export default function getCampaignByCode({ code, campaignToJoinRepository }) {
  return campaignToJoinRepository.getByCode(code);
}
