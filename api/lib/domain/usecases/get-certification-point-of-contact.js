const getCertificationPointOfContact = async function ({
  userId,
  centerRepository,
  certificationPointOfContactRepository,
}) {
  const { authorizedCenterIds, certificationPointOfContactDTO } =
    await certificationPointOfContactRepository.getAuthorizedCenterIds(userId);
  const centerList = await Promise.all(
    authorizedCenterIds.map((authorizedCenterId) => centerRepository.getById({ id: authorizedCenterId })),
  );

  const allowedCertificationCenterAccesses =
    await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);

  return certificationPointOfContactRepository.getPointOfContact({
    userId,
    certificationPointOfContactDTO,
    allowedCertificationCenterAccesses,
  });
};

export { getCertificationPointOfContact };
