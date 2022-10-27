const CertificationCenterInvitation = require('../../domain/models/CertificationCenterInvitation');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(invitationDTO) {
  return new CertificationCenterInvitation({
    id: invitationDTO.id,
    email: invitationDTO.email,
    updatedAt: invitationDTO.updatedAt,
    certificationCenterId: invitationDTO.certificationCenterId,
    certificationCenterName: invitationDTO.certificationCenterName,
    status: invitationDTO.status,
  });
}

module.exports = {
  async findPendingByCertificationCenterId({ certificationCenterId }) {
    const pendingCertificationCenterInvitations = await knex
      .select('id', 'email', 'certificationCenterId', 'updatedAt')
      .from('certification-center-invitations')
      .where({ certificationCenterId, status: CertificationCenterInvitation.StatusType.PENDING })
      .orderBy('email')
      .orderBy('updatedAt', 'desc');
    return pendingCertificationCenterInvitations.map(_toDomain);
  },

  async getByIdAndCode({ id, code }) {
    const certificationCenterInvitation = await knex('certification-center-invitations')
      .select({
        id: 'certification-center-invitations.id',
        status: 'certification-center-invitations.status',
        certificationCenterId: 'certification-center-invitations.certificationCenterId',
        certificationCenterName: 'certification-centers.name',
      })
      .leftJoin(
        'certification-centers',
        'certification-centers.id',
        'certification-center-invitations.certificationCenterId'
      )
      .where({
        'certification-center-invitations.id': id,
        code,
      })
      .first();

    if (!certificationCenterInvitation) {
      throw new NotFoundError('This certification center invitation was not found');
    }

    return _toDomain(certificationCenterInvitation);
  },
};
