import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationLearner } from '../../domain/models/prescription/entities/OrganizationLearner.js';

export async function getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId }) {
  const existingOrganizationLearner = await findOrganizationLearner({ userId, organizationId });

  const knexConnection = DomainTransaction.getConnection();

  if (existingOrganizationLearner) {
    if (existingOrganizationLearner.isDisabled) {
      await knexConnection('organization-learners')
        .update({ isDisabled: false })
        .where({ id: existingOrganizationLearner.id })
        .returning('id');
    }

    return _toDomain({ id: existingOrganizationLearner.id });
  } else {
    try {
      const [{ id }] = await knexConnection('organization-learners').insert(
        {
          userId,
          organizationId,
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
        },
        ['id'],
      );
      return _toDomain({ id });
    } catch (error) {
      if (knexUtils.isUniqConstraintViolated(error) && error.constraint === 'one_active_organization_learner') {
        throw new OrganizationLearnersCouldNotBeSavedError(
          `User ${organizationLearner.userId} already inserted into ${organizationLearner.organizationId}`,
        );
      }

      throw error;
    }
  }
}

export async function findOrganizationLearner({ userId, organizationId }) {
  const knexConnection = DomainTransaction.getConnection();
  const result = await knexConnection('view-active-organization-learners')
    .where({
      userId,
      organizationId,
    })
    .first();

  return result ? _toDomain(result) : null;
}

const _toDomain = (organizationLearner) => new OrganizationLearner(organizationLearner);
