/**
 * @typedef {import('../../../../certification/enrolment/domain/models/Center.js').Center} Center
 * @typedef {import('../DataProtectionOfficer.js').DataProtectionOfficer} DataProtectionOfficer
 */

import { Habilitation } from '../../../../certification/enrolment/domain/models/Habilitation.js';
import { CenterForAdmin } from '../CenterForAdmin.js';

export class CenterForAdminFactory {
  /**
   * @param {Object} params
   * @param {Center} params.center
   * @param {DataProtectionOfficer} params.dataProtectionOfficer
   */
  static fromCenterAndDataProtectionOfficer({ center, archivistFullName, dataProtectionOfficer = {} }) {
    return new CenterForAdmin({
      center: {
        id: center.id,
        type: center.type,
        habilitations: center.habilitations?.map((habilitation) => new Habilitation(habilitation)) ?? [],
        name: center.name,
        externalId: center.externalId,
        createdAt: undefined,
        updatedAt: undefined,
        archivedAt: center.archivedAt,
        isComplementaryAlonePilot: center.isComplementaryAlonePilot,
      },
      archivistFullName,
      dataProtectionOfficer: {
        firstName: dataProtectionOfficer.firstName,
        lastName: dataProtectionOfficer.lastName,
        email: dataProtectionOfficer.email,
      },
    });
  }
}
