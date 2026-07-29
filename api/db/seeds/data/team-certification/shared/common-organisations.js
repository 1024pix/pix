import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { CenterTypes } from '../../../../../src/organizational-entities/domain/read-models/CenterTypes.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import * as organizationCreationValidator from '../../../../../src/organizational-entities/domain/validators/organization-creation-validator.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import { COUNTRY_FRANCE_CODE } from '../../common/constants.js';
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

      const administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'Sco administration team' });
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Sco organization learner type',
      });
      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Certification SCO Managing students organization',
        type: CenterTypes.SCO,
        isManagingStudents: true,
        externalId: 'SCO_MANAGING_STUDENTS_EXTERNAL_ID',
        administrationTeamId: administrationTeam.id,
        countryCode: COUNTRY_FRANCE_CODE,
        organizationLearnerType: new OrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
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

      const administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'Pro administration team' });
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Pro organization learner type',
      });

      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Certification PRO organization',
        type: CenterTypes.PRO,
        isManagingStudents: false,
        externalId: 'PRO_EXTERNAL_ID',
        administrationTeamId: administrationTeam.id,
        countryCode: COUNTRY_FRANCE_CODE,
        organizationLearnerType: new OrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
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
  static async getSup({ databaseBuilder }) {
    if (!this.sup) {
      this.sup = {};
      const organizationMember = await new CommonOrganizations({ databaseBuilder }).#initOrgaMember();

      const administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'SUP administration team' });
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'SUP organization learner type',
      });
      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Certification SUP organization',
        type: CenterTypes.SUP,
        isManagingStudents: false,
        externalId: 'SUP_EXTERNAL_ID',
        administrationTeamId: administrationTeam.id,
        countryCode: COUNTRY_FRANCE_CODE,
        organizationLearnerType: new OrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
      });

      const supOrganization = await organizationalEntitiesUsecases.createOrganization({
        organization,
        organizationCreationValidator,
      });

      const supOrganizationMembership = await teamUsecases.createMembership({
        organizationRole: Membership.roles.ADMIN,
        userId: organizationMember.id,
        organizationId: supOrganization.id,
      });

      this.sup = {
        organizationMember,
        organization: supOrganization,
        organizationMembership: supOrganizationMembership,
      };
    }

    return this.sup;
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
