const CertificationCenterInvitation = require('../../domain/models/CertificationCenterInvitation');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

const CERTIFICATION_CENTER_INVITATIONS = 'certification-center-invitations';

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
    const pendingCertificationCenterInvitations = await knex(CERTIFICATION_CENTER_INVITATIONS)
      .select('id', 'email', 'certificationCenterId', 'updatedAt')
      .where({ certificationCenterId, status: CertificationCenterInvitation.StatusType.PENDING })
      .orderBy('updatedAt', 'desc');
    return pendingCertificationCenterInvitations.map(_toDomain);
  },

  async getByIdAndCode({ id, code }) {
    const certificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS)
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
      throw new NotFoundError("L'invitation à ce centre de certfication n'existe pas");
    }

    return _toDomain(certificationCenterInvitation);
  },

  async create(invitation) {
    const [newInvitation] = await knex(CERTIFICATION_CENTER_INVITATIONS)
      .insert(invitation)
      .returning(['id', 'email', 'updatedAt']);
    return _toDomain(newInvitation);
  },
};
