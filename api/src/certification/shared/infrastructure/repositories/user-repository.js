import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { User } from '../../../enrolment/domain/models/User.js';

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const userData = await knexConn
    .select({
      id: 'users.id',
      lang: 'users.lang',
      organizationLearnerIds: knexConn.raw(
        `array_agg("view-active-organization-learners".id order by "view-active-organization-learners".id)`,
      ),
    })
    .from('users')
    .leftJoin('view-active-organization-learners', 'view-active-organization-learners.userId', 'users.id')
    .where('users.id', id)
    .groupBy('users.id')
    .first();
  if (!userData) {
    return null;
  }

  return new User({
    ...userData,
    organizationLearnerIds: _.compact(userData.organizationLearnerIds),
  });
}
