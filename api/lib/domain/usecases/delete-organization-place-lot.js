export default async function deleteOrganizationPlaceLot({
  organizationPlaceId,
  userId,
  organizationPlacesLotRepository,
}) {
  await organizationPlacesLotRepository.get(organizationPlaceId);
  await organizationPlacesLotRepository.delete({ id: organizationPlaceId, deletedBy: userId });
}
