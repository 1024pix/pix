const getCampaignByCode = async function ({
  code,
  campaignToJoinRepository,
  organizationLearnerImportFormatRepository,
}) {
  const campaignToJoin = await campaignToJoinRepository.getByCode({ code });

  if (campaignToJoin.isRestricted) {
    const config = await organizationLearnerImportFormatRepository.get(campaignToJoin.organizationId);

    if (config) campaignToJoin.setReconciliationFields(config.reconciliationFields);
  }

  return campaignToJoin;
};

export { getCampaignByCode };
