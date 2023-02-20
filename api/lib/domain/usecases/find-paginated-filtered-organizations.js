export default function findPaginatedFilteredOrganizations({ filter, page, organizationRepository }) {
  return organizationRepository.findPaginatedFiltered({ filter, page });
}
