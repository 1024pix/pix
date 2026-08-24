/**
 * @typedef {import('../Center.js').Center} Center
 * @typedef {import('../DataProtectionOfficer.js').DataProtectionOfficer} DataProtectionOfficer
 */

import { CenterForAdmin } from '../CenterForAdmin.js';
import { Habilitation } from '../Habilitation.js';

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
        createdAt: center.createdAt,
        updatedAt: undefined,
        archivedAt: center.archivedAt,
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
