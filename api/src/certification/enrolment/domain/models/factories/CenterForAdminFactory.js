/**
 * @typedef {import('../Center.js').Center} Center
 * @typedef {import('../../../../../organizational-entities/domain/models/DataProtectionOfficer.js').DataProtectionOfficer} DataProtectionOfficer
 */

import { CenterForAdmin } from '../CenterForAdmin.js';
import { Habilitation } from '../Habilitation.js';

export class CenterForAdminFactory {
  /**
   * @param {Object} params
   * @param {Center} params.center
   * @param {DataProtectionOfficer} params.dataProtectionOfficer
   */
  static fromCenterAndDataProtectionOfficer({ center, dataProtectionOfficer = {} }) {
    return new CenterForAdmin({
      center: {
        id: center.id,
        type: center.type,
        habilitations: center.habilitations?.map((habilitation) => new Habilitation(habilitation)) ?? [],
        name: center.name,
        externalId: center.externalId,
        createdAt: undefined,
        updatedAt: undefined,
        isComplementaryAlonePilot: center.isComplementaryAlonePilot,
        isV3Pilot: center.isV3Pilot,
      },
      dataProtectionOfficer: {
        firstName: dataProtectionOfficer.firstName,
        lastName: dataProtectionOfficer.lastName,
        email: dataProtectionOfficer.email,
      },
    });
  }
}
