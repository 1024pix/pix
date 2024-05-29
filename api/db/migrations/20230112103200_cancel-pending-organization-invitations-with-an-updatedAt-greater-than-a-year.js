import dayjs from 'dayjs';

import { statuses as StatusType } from '../../src/team/domain/models/OrganizationInvitation.js';

const up = function (knex) {
  return knex('organization-invitations')
    .update({ status: StatusType.CANCELLED, updatedAt: new Date() })
    .where('status', StatusType.PENDING)
    .andWhere('updatedAt', '<', dayjs().subtract(1, 'year'));
};

// eslint-disable-next-line no-empty-function
const down = function () {};
export { down, up };
