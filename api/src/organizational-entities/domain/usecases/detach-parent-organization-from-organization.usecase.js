import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UnableToDetachParentOrganizationFromChildOrganization } from '../errors.js';
import { OrganizationForUpdate } from '../models/OrganizationForUpdate.js';

const detachParentOrganizationFromOrganization = withTransaction(async function ({
  childOrganizationId,
  organizationForAdminRepository,
}) {
  const childOrganization = await organizationForAdminRepository.get({ organizationId: childOrganizationId });

  // TODO: _checkOrganizationHasParent doit vérifier via fct_structures (parent_structure_id) et non organizations.parentOrganizationId
  _checkOrganizationHasParent(childOrganization);

  const organizationForUpdate = new OrganizationForUpdate(childOrganization);
  organizationForUpdate.detachParent();

  // TODO: mettre à jour fct_structures.parent_structure_id et networkId à null lors du détachement
  await organizationForAdminRepository.update({ organization: organizationForUpdate });
});

function _checkOrganizationHasParent(organization) {
  if (!organization.parentOrganizationId) {
    throw new UnableToDetachParentOrganizationFromChildOrganization({
      message: 'Unable to detach parent organization from child because it has no parent.',
      meta: { organizationId: Number(organization.id) },
    });
  }
}
export { detachParentOrganizationFromOrganization };
