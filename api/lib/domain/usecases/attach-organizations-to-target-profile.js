module.exports = async function attachTargetProfilesToOrganization({
  targetProfileId,
  organizationIds,
  targetProfileRepository,
}) {

  const targetProfile = await targetProfileRepository.get(targetProfileId);
  targetProfile.addOrganizations(organizationIds);

  await targetProfileRepository.attachOrganizations(targetProfile);
};
