import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import { UnableToAttachChildOrganizationToParentOrganizationError } from '../errors.js';

const attachChildOrganizationToOrganization = withTransaction(
  async ({
    childOrganizationIds,
    parentOrganizationId,
    organizationForAdminRepository = injectedRepositories.organizationForAdminRepository,
  } = {}) => {
    const childOrganizationIdsArray = childOrganizationIds.split(',').map(Number);

    for (const childOrganizationId of childOrganizationIdsArray) {
      _assertChildAndParentOrganizationIdsAreDifferent({
        childOrganizationId,
        parentOrganizationId,
      });
      await _assertChildOrganizationDoesNotHaveChildren({ childOrganizationId, organizationForAdminRepository });

      const childOrganizationForAdmin = await organizationForAdminRepository.get({
        organizationId: childOrganizationId,
      });

      _assertChildOrganizationNotAlreadyAttached(childOrganizationForAdmin);

      const parentOrganizationForAdmin = await organizationForAdminRepository.get({
        organizationId: parentOrganizationId,
      });

      _assertParentOrganizationIsNotChildOrganization(parentOrganizationForAdmin);

      childOrganizationForAdmin.updateParentOrganizationId(parentOrganizationId);

      await organizationForAdminRepository.update({ organization: childOrganizationForAdmin });
    }
  },
);

export { attachChildOrganizationToOrganization };

function _assertChildAndParentOrganizationIdsAreDifferent({ childOrganizationId, parentOrganizationId }) {
  if (childOrganizationId === parentOrganizationId) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF',
      message: 'Unable to attach child organization to itself',
      meta: {
        childOrganizationId,
        parentOrganizationId,
      },
    });
  }
}

function _assertChildOrganizationNotAlreadyAttached(childOrganizationForAdmin) {
  if (childOrganizationForAdmin.parentOrganizationId) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION',
      message: 'Unable to attach already attached child organization',
      meta: {
        childOrganizationId: childOrganizationForAdmin.id,
      },
    });
  }
}

function _assertParentOrganizationIsNotChildOrganization(parentOrganization) {
  if (parentOrganization.parentOrganizationId) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ANOTHER_CHILD_ORGANIZATION',
      message: 'Unable to attach child organization to parent organization which is also a child organization',
      meta: {
        grandParentOrganizationId: parentOrganization.parentOrganizationId,
        parentOrganizationId: parentOrganization.id,
      },
    });
  }
}

async function _assertChildOrganizationDoesNotHaveChildren({ childOrganizationId, organizationForAdminRepository }) {
  const children = await organizationForAdminRepository.findChildrenByParentOrganizationId({
    parentOrganizationId: childOrganizationId,
  });

  if (children.length) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_PARENT_ORGANIZATION_AS_CHILD_ORGANIZATION',
      message: 'Unable to attach child organization because it is already parent of organizations',
      meta: {
        childOrganizationId,
      },
    });
  }
}
