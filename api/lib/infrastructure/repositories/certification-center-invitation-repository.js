import CertificationCenterInvitation from '../../domain/models/CertificationCenterInvitation';
import { knex } from '../../../db/knex-database-connection';
import { NotFoundError } from '../../domain/errors';

const CERTIFICATION_CENTER_INVITATIONS = 'certification-center-invitations';

function _toDomain(invitationDTO) {
  return new CertificationCenterInvitation({
    id: invitationDTO.id,
    email: invitationDTO.email,
    code: invitationDTO.code,
    updatedAt: invitationDTO.updatedAt,
    certificationCenterId: invitationDTO.certificationCenterId,
    certificationCenterName: invitationDTO.certificationCenterName,
    status: invitationDTO.status,
  });
}

export default {
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
      throw new NotFoundError("L'invitation à ce centre de certification n'existe pas");
    }

    return _toDomain(certificationCenterInvitation);
  },

  async get(id) {
    const certificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS)
      .select('*')
      .where({ id })
      .first();
    if (!certificationCenterInvitation) {
      throw new NotFoundError("L'invitation à ce centre de certification n'existe pas");
    }
    return _toDomain(certificationCenterInvitation);
  },

  async findOnePendingByEmailAndCertificationCenterId({ email, certificationCenterId }) {
    const existingPendingInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS)
      .select('id')
      .where({ email, certificationCenterId, status: CertificationCenterInvitation.StatusType.PENDING })
      .first();

    return existingPendingInvitation ? _toDomain(existingPendingInvitation) : null;
  },

  async create(invitation) {
    const [newInvitation] = await knex(CERTIFICATION_CENTER_INVITATIONS)
      .insert(invitation)
      .returning(['id', 'email', 'code', 'certificationCenterId', 'updatedAt']);

    const { name: certificationCenterName } = await knex('certification-centers')
      .select('name')
      .where({ id: newInvitation.certificationCenterId })
      .first();

    return _toDomain({ ...newInvitation, certificationCenterName });
  },

  async update(certificationCenterInvitation) {
    const [updatedCertificationCenterInvitation] = await knex('certification-center-invitations')
      .update({ updatedAt: new Date() })
      .where({ id: certificationCenterInvitation.id })
      .returning(['id', 'email', 'code', 'certificationCenterId', 'updatedAt']);

    const { name: certificationCenterName } = await knex('certification-centers')
      .select('name')
      .where({ id: updatedCertificationCenterInvitation.certificationCenterId })
      .first();

    return _toDomain({ ...updatedCertificationCenterInvitation, certificationCenterName });
  },

  async markAsCancelled({ id }) {
    const [certificationCenterInvitation] = await knex('certification-center-invitations')
      .where({ id })
      .update({
        status: CertificationCenterInvitation.StatusType.CANCELLED,
        updatedAt: new Date(),
      })
      .returning('*');
    if (!certificationCenterInvitation) {
      throw new NotFoundError(`Certification center invitation of id ${id} is not found.`);
    }
    return _toDomain(certificationCenterInvitation);
  },
};
