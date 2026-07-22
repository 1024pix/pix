import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  OrganizationLearnerTypeNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCases | update-organization', function () {
  let adminUserId;
  beforeEach(async function () {
    adminUserId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
  });

  it('updates organization information', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;

    const newAdministrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;

    const newOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
      id: 1,
      name: 'New Type',
    });

    const newCountry = databaseBuilder.factory.buildCertificationCpfCountry({
      code: 99102,
      originalName: 'Islande',
      commonName: 'Islande',
    });

    await databaseBuilder.commit();

    const organizationNewInformation = domainBuilder.buildOrganizationForAdmin({
      id: organizationId,
      name: "Nouveau nom d'organization",
      administrationTeamId: newAdministrationTeamId,
      countryCode: newCountry.code,
      organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
        id: newOrganizationLearnerType.id,
        name: undefined,
      }),
    });

    // when
    const updatedOrganization = await usecases.updateOrganizationInformation({
      userId: adminUserId,
      organization: organizationNewInformation,
    });

    // then
    expect(updatedOrganization).to.be.instanceOf(OrganizationForAdmin);
    expect(updatedOrganization.name).to.equal("Nouveau nom d'organization");
    expect(updatedOrganization.administrationTeamId).to.equal(newAdministrationTeamId);
    expect(updatedOrganization.countryCode).to.equal(99102);
    expect(updatedOrganization.organizationLearnerType.name).to.equal(newOrganizationLearnerType.name);
  });

  context('features', function () {
    let organizationId;
    beforeEach(async function () {
      databaseBuilder.factory.buildFeature.pixJuniorFeatures();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });
    context('Activating learner import format', function () {
      it('should delete previous organization learners', async function () {
        const learnerFromOrganization = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        const learnerFromOtherOrganization = databaseBuilder.factory.buildOrganizationLearner();
        const newAdministrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;

        const newOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
          id: 1,
          name: 'New Type',
        });

        const newCountry = databaseBuilder.factory.buildCertificationCpfCountry({
          code: 99102,
          originalName: 'Islande',
          commonName: 'Islande',
        });
        await databaseBuilder.commit();

        const organizationNewInformation = domainBuilder.buildOrganizationForAdmin({
          id: organizationId,
          name: "Nouveau nom d'organization",
          administrationTeamId: newAdministrationTeamId,
          countryCode: newCountry.code,
          organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
            id: newOrganizationLearnerType.id,
            name: undefined,
          }),
          features: {
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'ONDE' } },
          },
        });
        await usecases.updateOrganizationInformation({
          userId: adminUserId,
          organization: organizationNewInformation,
        });
        const learnerInDB = await knex('organization-learners').where({ id: learnerFromOrganization.id }).first();
        expect(learnerInDB.deletedAt).not.null;

        const otherLearnerInDB = await knex('organization-learners')
          .where({ id: learnerFromOtherOrganization.id })
          .first();
        expect(otherLearnerInDB.deletedAt).null;
      });
    });
  });

  context('when organization learner type does not exist', function () {
    it('throws an OrganizationLearnerTypeNotFound error', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();

      const organizationNewInformations = domainBuilder.buildOrganizationForAdmin({
        id: organizationId,
        organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
          id: 123,
          name: undefined,
        }),
      });

      // when
      const error = await catchErr(usecases.updateOrganizationInformation)({
        userId: adminUserId,
        organization: organizationNewInformations,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationLearnerTypeNotFound);
      expect(error.meta.organizationLearnerTypeId).to.equal(organizationNewInformations.organizationLearnerType.id);
    });
  });

  context('when administration team does not exist', function () {
    it('throws an AdministrationTeamNotFound error', async function () {
      // given
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
      const organizationId = databaseBuilder.factory.buildOrganization({
        organizationLearnerTypeId: organizationLearnerType.id,
      }).id;

      await databaseBuilder.commit();

      const organizationNewInformations = domainBuilder.buildOrganizationForAdmin({
        id: organizationId,
        administrationTeamId: 123,
        organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
      });

      // when
      const error = await catchErr(usecases.updateOrganizationInformation)({
        userId: adminUserId,
        organization: organizationNewInformations,
      });

      // then
      expect(error).to.be.instanceOf(AdministrationTeamNotFound);
    });
  });

  context('when country does not exist', function () {
    it('should throw a CountryNotFound error', async function () {
      // given
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
      const organization = databaseBuilder.factory.buildOrganization({
        organizationLearnerTypeId: organizationLearnerType.id,
      });

      await databaseBuilder.commit();

      const organizationNewInformations = domainBuilder.buildOrganizationForAdmin({
        id: organization.id,
        administrationTeamId: organization.administrationTeamId,
        countryCode: 123456,
        organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
      });

      // when
      const error = await catchErr(usecases.updateOrganizationInformation)({
        userId: adminUserId,
        organization: organizationNewInformations,
      });

      // then
      expect(error).to.be.instanceOf(CountryNotFoundError);
      expect(error.message).equal('Country not found for code 123456');
      expect(error.meta.countryCode).to.equal(123456);
    });
  });

  context('when there is no new country code', function () {
    it('should not update country code', async function () {
      // given
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
      const initialOrganization = databaseBuilder.factory.buildOrganization({
        organizationLearnerTypeId: organizationLearnerType.id,
      });

      const newAdministrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;

      await databaseBuilder.commit();

      const organizationNewInformations = domainBuilder.buildOrganizationForAdmin({
        id: initialOrganization.id,
        administrationTeamId: newAdministrationTeamId,
        countryCode: null,
        organizationLearnerType: domainBuilder.acquisition.buildOrganizationLearnerType({
          id: organizationLearnerType.id,
        }),
      });

      // when
      const response = await usecases.updateOrganizationInformation({
        userId: adminUserId,
        organization: organizationNewInformations,
      });

      // then
      expect(response.countryCode).equal(initialOrganization.countryCode);
    });
  });
});
