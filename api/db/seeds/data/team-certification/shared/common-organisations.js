import { CenterTypes } from '../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import * as organizationCreationValidator from '../../../../../src/organizational-entities/domain/validators/organization-creation-validator.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import { acceptPixOrgaTermsOfService } from '../../common/tooling/legal-documents.js';
import { SHARED_ORGANIZATION_USER_ID } from './constants.js';

/**
 * Default Certification organizations
 */
export class CommonOrganizations {
  static #organizationMember;

  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  static async getScoManagingStudents({ databaseBuilder }) {
    if (!this.sco) {
      this.sco = {};
      const organizationMember = await new CommonOrganizations({ databaseBuilder }).#initOrgaMember();

      const organization = new OrganizationForAdmin({
        name: 'Certification SCO Managing students organization',
        type: CenterTypes.SCO,
        isManagingStudents: true,
        externalId: 'SCO_MANAGING_STUDENTS_EXTERNAL_ID',
      });

      const scoOrganization = await organizationalEntitiesUsecases.createOrganization({
        organization,
        organizationCreationValidator,
      });

      const scoOrganizationMembership = await teamUsecases.createMembership({
        organizationRole: Membership.roles.ADMIN,
        userId: organizationMember.id,
        organizationId: scoOrganization.id,
      });

      this.sco = {
        organizationMember,
        organization: scoOrganization,
        organizationMembership: scoOrganizationMembership,
      };
    }

    return this.sco;
  }

  static async getPro({ databaseBuilder }) {
    if (!this.pro) {
      this.pro = {};
      const organizationMember = await new CommonOrganizations({ databaseBuilder }).#initOrgaMember();

      const organization = new OrganizationForAdmin({
        name: 'Certification PRO organization',
        type: CenterTypes.PRO,
        isManagingStudents: false,
        externalId: 'PRO_EXTERNAL_ID',
      });

      const proOrganization = await organizationalEntitiesUsecases.createOrganization({
        organization,
        organizationCreationValidator,
      });

      const proOrganizationMembership = await teamUsecases.createMembership({
        organizationRole: Membership.roles.ADMIN,
        userId: organizationMember.id,
        organizationId: proOrganization.id,
      });

      this.pro = {
        organizationMember,
        organization: proOrganization,
        organizationMembership: proOrganizationMembership,
      };
    }

    return this.pro;
  }

  async #initOrgaMember() {
    if (!CommonOrganizations.#organizationMember) {
      CommonOrganizations.#organizationMember = this.databaseBuilder.factory.buildUser.withRawPassword({
        id: SHARED_ORGANIZATION_USER_ID,
        firstName: 'Certif',
        lastName: 'Pix Orga member',
        email: 'certif-prescriptor@example.net',
        cgu: true,
        lang: 'fr',
        lastTermsOfServiceValidatedAt: new Date(),
        mustValidateTermsOfService: false,
        pixCertifTermsOfServiceAccepted: true,
      });

      acceptPixOrgaTermsOfService(this.databaseBuilder, CommonOrganizations.#organizationMember.id);

      await this.databaseBuilder.commit();
    }
    return CommonOrganizations.#organizationMember;
  }
}
