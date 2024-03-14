import { UnableToAttachChildOrganizationToParentOrganizationError } from '../errors.js';

async function attachChildOrganizationToOrganization({
  childOrganizationId,
  parentOrganizationId,
  organizationForAdminRepository,
}) {
  _assertChildAndParentOrganizationIdsAreDifferent({ childOrganizationId, parentOrganizationId });
  await _assertChildOrganizationDoesNotHaveChildren({ childOrganizationId, organizationForAdminRepository });

  const childOrganizationForAdmin = await organizationForAdminRepository.get(childOrganizationId);

  _assertChildOrganizationNotAlreadyAttached(childOrganizationForAdmin);

  const parentOrganizationForAdmin = await organizationForAdminRepository.get(parentOrganizationId);

  _assertParentOrganizationIsNotChildOrganization(parentOrganizationForAdmin);
  _assertChildOrganizationHaveSameTypeAsParentOrganization({ childOrganizationForAdmin, parentOrganizationForAdmin });

  childOrganizationForAdmin.updateParentOrganizationId(parentOrganizationId);

  await organizationForAdminRepository.update(childOrganizationForAdmin);
}

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

function _assertChildOrganizationHaveSameTypeAsParentOrganization({
  childOrganizationForAdmin,
  parentOrganizationForAdmin,
}) {
  if (childOrganizationForAdmin.type !== parentOrganizationForAdmin.type) {
    throw new UnableToAttachChildOrganizationToParentOrganizationError({
      code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_WITHOUT_SAME_TYPE',
      message: 'Unable to attach child organization with a different type as the parent organization',
      meta: {
        childOrganizationId: childOrganizationForAdmin.id,
        childOrganizationType: childOrganizationForAdmin.type,
        parentOrganizationId: parentOrganizationForAdmin.id,
        parentOrganizationType: parentOrganizationForAdmin.type,
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
  const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(childOrganizationId);

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
