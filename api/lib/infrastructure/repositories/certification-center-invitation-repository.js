const CertificationCenterInvitation = require('../../domain/models/CertificationCenterInvitation');
const { knex } = require('../../../db/knex-database-connection');

function _toDomain(invitationDTO) {
  return new CertificationCenterInvitation({
    id: invitationDTO.id,
    email: invitationDTO.email,
    updatedAt: invitationDTO.updatedAt,
    certificationCenterId: invitationDTO.certificationCenterId,
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
};
