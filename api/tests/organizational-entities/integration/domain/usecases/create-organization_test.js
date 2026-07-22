import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  OrganizationLearnerTypeNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { EntityValidationError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | UseCases | create-organization', function () {
  let superAdminUserId;

  beforeEach(async function () {
    superAdminUserId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildAdministrationTeam({ id: 1234, name: 'Équipe 1' });
    databaseBuilder.factory.buildOrganizationLearnerType({ id: 5678 });
    databaseBuilder.factory.buildCertificationCpfCountry({
      code: 99100,
      commonName: 'France',
      originalName: 'France',
    });

    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
    await databaseBuilder.commit();
  });

  it('returns newly created organization', async function () {
    // given
    const organization = new OrganizationForAdmin({
      name: 'ACME',
      type: 'PRO',
      documentationUrl: 'https://pix.fr',
      createdBy: superAdminUserId,
      administrationTeamId: 1234,
      countryCode: 99100,
      externalId: 'My external Id',
      provinceCode: '078',
      organizationLearnerType: new OrganizationLearnerType({
        id: 5678,
      }),
    });

    // when
    const createdOrganization = await usecases.createOrganization({ organization });

    // then
    expect(createdOrganization).to.be.instanceOf(OrganizationForAdmin);
    expect(createdOrganization.createdBy).to.be.equal(superAdminUserId);
    expect(createdOrganization.name).to.be.equal(organization.name);
    expect(createdOrganization.type).to.be.equal(organization.type);
    expect(createdOrganization.documentationUrl).to.be.equal(organization.documentationUrl);
    expect(createdOrganization.dataProtectionOfficer.firstName).to.equal('');
    expect(createdOrganization.dataProtectionOfficer.lastName).to.equal('');
    expect(createdOrganization.dataProtectionOfficer.email).to.equal('');
    expect(createdOrganization.countryCode).to.equal(99100);
    expect(createdOrganization.externalId).to.equal('My external Id');
    expect(createdOrganization.provinceCode).to.equal('078');
  });

  describe('error cases', function () {
    describe('when parent organization is provided', function () {
      describe('when parent organization does not exist', function () {
        it('throws an error', async function () {
          // given
          const organization = new OrganizationForAdmin({
            name: 'ACME',
            type: 'PRO',
            documentationUrl: 'https://pix.fr',
            createdBy: superAdminUserId,
            administrationTeamId: 1234,
            parentOrganizationId: 9999,
            countryCode: 99100,
          });

          // when
          const error = await catchErr(usecases.createOrganization)({ organization });

          // then
          expect(error).to.deep.equal(new NotFoundError('Not found organization for ID 9999'));
        });
      });
    });

    describe('when organization administration team does not exist', function () {
      it('throws AdministrationTeamNotFound error', async function () {
        // given
        const organization = new OrganizationForAdmin({
          name: 'ACME',
          type: 'PRO',
          documentationUrl: 'https://pix.fr',
          createdBy: superAdminUserId,
          administrationTeamId: 9999,
          countryCode: 99100,
          organizationLearnerType: new OrganizationLearnerType({
            id: 5678,
          }),
        });

        // when
        const error = await catchErr(usecases.createOrganization)({ organization });

        // then
        expect(error).to.deep.equal(
          new AdministrationTeamNotFound({
            meta: { administrationTeamId: organization.administrationTeamId },
          }),
        );
      });
    });

    describe('when organization learner type does not exist', function () {
      it('throws OrganizationLearnerTypeNotFound error', async function () {
        // given
        const organization = new OrganizationForAdmin({
          name: 'ACME',
          type: 'PRO',
          documentationUrl: 'https://pix.fr',
          createdBy: superAdminUserId,
          administrationTeamId: 1234,
          countryCode: 99100,
          organizationLearnerType: new OrganizationLearnerType({
            id: 9012,
          }),
        });

        // when
        const error = await catchErr(usecases.createOrganization)({
          organization,
        });

        // then
        expect(error).to.deep.equal(
          new OrganizationLearnerTypeNotFound({
            meta: {
              organizationLearnerTypeId: organization.organizationLearnerType.id,
            },
            message: `Organization learner type not found for id ${organization.organizationLearnerType.id}`,
          }),
        );
      });
    });

    describe('when country does not exist', function () {
      it('throws CountryNotFoundError', async function () {
        // given
        const organization = new OrganizationForAdmin({
          name: 'ACME',
          type: 'PRO',
          documentationUrl: 'https://pix.fr',
          createdBy: superAdminUserId,
          administrationTeamId: 1234,
          countryCode: 99999,
          organizationLearnerType: new OrganizationLearnerType({
            id: 5678,
          }),
        });

        // when
        const error = await catchErr(usecases.createOrganization)({ organization });

        // then
        expect(error).to.be.instanceOf(CountryNotFoundError);
        expect(error.message).to.equal('Country not found for code 99999');
        expect(error.meta).to.deep.equal({ countryCode: 99999 });
      });
    });

    context('when params are not valid', function () {
      it('rejects an EntityValidationError', async function () {
        // given
        const organization = new OrganizationForAdmin({
          name: 'ACME',
          type: 'PRO',
          administrationTeamId: undefined,
          countryCode: undefined,
        });

        // when
        const error = await catchErr(usecases.createOrganization)({ organization });

        // then
        expect(error).to.be.an.instanceOf(EntityValidationError);
      });
    });
  });

  describe('junior organization', function () {
    it('returns newly created organization', async function () {
      // given
      databaseBuilder.factory.buildFeature.pixJuniorFeatures();
      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'ACME',
        type: Organization.types.SCO1D,
        documentationUrl: 'https://pix.fr',
        createdBy: superAdminUserId,
        administrationTeamId: 1234,
        countryCode: 99100,
        organizationLearnerType: new OrganizationLearnerType({
          id: 5678,
        }),
      });

      // when
      const createdOrganization = await usecases.createOrganization({ organization });
      // then
      expect(createdOrganization).to.be.instanceOf(OrganizationForAdmin);
      expect(createdOrganization.createdBy).to.be.equal(superAdminUserId);
      expect(createdOrganization.name).to.be.equal(organization.name);
      expect(createdOrganization.type).to.be.equal(organization.type);
      expect(createdOrganization.documentationUrl).to.be.equal(organization.documentationUrl);
      expect(createdOrganization.dataProtectionOfficer.firstName).to.equal('');
      expect(createdOrganization.dataProtectionOfficer.lastName).to.equal('');
      expect(createdOrganization.dataProtectionOfficer.email).to.equal('');
    });
  });
});
