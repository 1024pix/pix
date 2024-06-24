const getCampaignByCode = async function ({ code, campaignToJoinRepository, organizationLearnerImportFormat }) {
  const campaignToJoin = await campaignToJoinRepository.getByCode({ code });

  if (campaignToJoin.isRestricted) {
    const config = await organizationLearnerImportFormat.get(campaignToJoin.organizationId);

    if (config) campaignToJoin.setReconciliationFields(config.reconciliationFields);
  }

  return campaignToJoin;
};

export { getCampaignByCode };
