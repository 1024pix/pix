import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UnableToAttachChildOrganizationToParentOrganizationError } from '../errors.js';

const attachChildOrganizationToOrganizationUsecase = withTransaction(
  async ({ childOrganizationIds, parentOrganizationId, organizationForAdminRepository, networkRepository }) => {
    const parentOrganization = await organizationForAdminRepository.get({
      organizationId: parentOrganizationId,
    });

    _assertParentOrganizationIsPartOfANetwork(parentOrganization);

    const childOrganizationIdsArray = childOrganizationIds.split(',').map(Number);

    _assertChildOrganizationIdsAreNumbers(childOrganizationIdsArray);

    for (const childOrganizationId of childOrganizationIdsArray) {
      _assertChildAndParentOrganizationIdsAreDifferent({
        childOrganizationId,
        parentOrganizationId,
      });

      const childOrganizationForAdmin = await organizationForAdminRepository.get({
        organizationId: childOrganizationId,
      });

      _assertChildOrganizationNotAlreadyPartOfANetwork(childOrganizationForAdmin);

      await networkRepository.attachOrganization({
        childOrganizationId: childOrganizationForAdmin.id,
        parentOrganizationId,
      });
    }
  },
);

export { attachChildOrganizationToOrganizationUsecase };

function _assertChildOrganizationIdsAreNumbers(ids) {
  if (ids.some(isNaN)) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'INVALID_CHILD_ORGANIZATION_IDS',
      message: 'Child organization IDs must be numbers',
    });
  }
}

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

function _assertChildOrganizationNotAlreadyPartOfANetwork(childOrganizationForAdmin) {
  if (childOrganizationForAdmin.network) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION',
      message: 'Unable to attach organization already belonging to a network',
      meta: {
        childOrganizationId: childOrganizationForAdmin.id,
      },
    });
  }
}

function _assertParentOrganizationIsPartOfANetwork(parentOrganization) {
  if (!parentOrganization.network) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_TO_ORGANIZATION_NOT_IN_NETWORK',
      message: 'Unable to attach organization to an organization that does not belong to a network',
      meta: {
        parentOrganizationId: parentOrganization.id,
      },
    });
  }
}
