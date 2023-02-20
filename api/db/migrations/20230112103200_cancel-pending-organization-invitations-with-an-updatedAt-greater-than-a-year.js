import dayjs from 'dayjs';
import { StatusType } from '../../lib/domain/models/OrganizationInvitation';

export const up = function (knex) {
  return knex('organization-invitations')
    .update({ status: StatusType.CANCELLED, updatedAt: new Date() })
    .where('status', StatusType.PENDING)
    .andWhere('updatedAt', '<', dayjs().subtract(1, 'year'));
};

export const down = function () {
  // do nothing.
};
