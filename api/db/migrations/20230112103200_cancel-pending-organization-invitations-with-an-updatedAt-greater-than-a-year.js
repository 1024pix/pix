const dayjs = require('dayjs');
const { StatusType } = require('../../lib/domain/models/OrganizationInvitation');

exports.up = function (knex) {
  return knex('organization-invitations')
    .update({ status: StatusType.CANCELLED, updatedAt: new Date() })
    .where('status', StatusType.PENDING)
    .andWhere('updatedAt', '<', dayjs().subtract(1, 'year'));
};

exports.down = function () {
  // do nothing.
};
