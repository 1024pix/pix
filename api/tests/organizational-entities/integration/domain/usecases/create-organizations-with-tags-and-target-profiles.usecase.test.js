import lodash from 'lodash';

import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  OrganizationLearnerTypeNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import {
  NotFoundError,
  ObjectValidationError,
  OrganizationTagNotFound,
  TargetProfileInvalidError,
} from '../../../../../src/shared/domain/errors.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  catchErr,
  databaseBuilder,
  expect,
  insertMultipleSendingFeatureForNewOrganization,
  knex,
} from '../../../../test-helper.js';

const { omit } = lodash;

describe('Integration | UseCases | create-organizations-with-tags-and-target-profiles', function () {
  let missionFeature,
    oralizationFeature,
    importStudentsFeature,
    ondeImportFormat,
    userId,
    byDefaultFeatureId,
    administrationTeamId,
    countryCode,
    organizationLearnerTypeId;

  beforeEach(async function () {
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
    missionFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT);
    oralizationFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER);
    importStudentsFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
    administrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;
    countryCode = databaseBuilder.factory.buildCertificationCpfCountry({
      code: 99997,
      originalName: 'Lalaland',
      commonName: 'Lalaland',
    }).code;
    organizationLearnerTypeId = databaseBuilder.factory.buildOrganizationLearnerType({ id: 1234 }).id;
    ondeImportFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name: ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE,
    });
    byDefaultFeatureId = await insertMultipleSendingFeatureForNewOrganization();

    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#errors', function () {
    context('when provided CSV file is empty', function () {
      it('throws an error', async function () {
        // given
        const organizations = [];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations,
        });

        // then
        expect(error).to.be.instanceOf(ObjectValidationError);
        expect(error.message).to.be.equal('Les organisations ne sont pas renseignées.');
      });
    });

    context('when required value are missing', function () {
      it('throws an error', async function () {
        //given
        const organizationsWithEmptyValues = [
          {
            type: '',
            externalId: '',
            name: '',
            provinceCode: '',
            credit: '',
            locale: '',
            tags: '',
            createdBy: null,
            documentationUrl: '',
            targetProfiles: '',
            organizationInvitationRole: '',
            administrationTeamId: null,
            countryCode: null,
            organizationLearnerTypeId: null,
          },
        ];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations: organizationsWithEmptyValues,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.eql([
          {
            attribute: 'type',
            message: "Le type fourni doit avoir l'une des valeurs suivantes : SCO,SUP,PRO,SCO-1D",
          },
          {
            attribute: 'type',
            message: 'Le type n’est pas renseigné.',
          },
          {
            attribute: 'externalId',
            message: "L'externalId n’est pas renseigné.",
          },
          {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.',
          },
          {
            attribute: 'locale',
            message:
              "La locale doit avoir l'une des valeurs suivantes : en, es, es-419, fr, nl, fr-be, fr-fr, nl-be, it",
          },
          {
            attribute: 'locale',
            message: "La locale n'est pas renseignée.",
          },
          {
            attribute: 'credit',
            message: 'Le crédit doit être un entier.',
          },
          {
            attribute: 'createdBy',
            message: "L'id du créateur est manquant",
          },
          {
            attribute: 'administrationTeamId',
            message: "L'id de l'équipe en charge est manquant",
          },
          { attribute: 'countryCode', message: 'Le code pays n’est pas renseigné.' },
          {
            attribute: 'organizationLearnerTypeId',
            message: "L'id du public prescrit est manquant",
          },
        ]);
      });
    });

    context('when invitation email is not valid', function () {
      it('throws an error', async function () {
        //given
        const organizationsWithTagsWithOneMissingExternalId = [
          {
            type: 'PRO',
            externalId: 'b200',
            name: 'Youness et Fils',
            provinceCode: '123',
            credit: 0,
            emailInvitations: 'youness',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'ADMIN',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
          {
            type: 'PRO',
            externalId: '',
            name: 'Andreia & Co',
            provinceCode: '345',
            credit: 10,
            emailInvitations: 'andreia@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'ADMIN',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
          {
            type: 'PRO',
            externalId: 'b201',
            name: 'Mathieu Bâtiment',
            provinceCode: '567',
            credit: 20,
            emailInvitations: 'mathieu@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'ADMIN',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
        ];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations: organizationsWithTagsWithOneMissingExternalId,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.eql([
          {
            attribute: 'emailInvitations',
            message: "L'email fourni n'est pas valide.",
          },
        ]);
      });
    });

    describe('when one provided tag is not found in database', function () {
      it('should rollback', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
        await databaseBuilder.commit();

        const organizationsWithTagsNotExists = [
          {
            type: 'PRO',
            externalId: 'b400',
            name: 'Mathieu Bâtiment',
            provinceCode: '567',
            credit: 20,
            emailInvitations: 'mathieu@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound_AnotherTagNotFound',
            targetProfiles: '123',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            organizationInvitationRole: 'ADMIN',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
          {
            type: 'PRO',
            externalId: 'b200',
            name: 'Youness et Fils',
            provinceCode: '123',
            credit: 0,
            emailInvitations: 'youness@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            targetProfiles: '123',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            organizationInvitationRole: 'MEMBER',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
          {
            type: 'PRO',
            externalId: 'b300',
            name: 'Andreia & Co',
            provinceCode: '345',
            credit: 10,
            emailInvitations: 'andreia@example.net',
            locale: 'fr-fr',
            tags: 'AnotherTagNotFound',
            targetProfiles: '123',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            organizationInvitationRole: 'ADMIN',
            administrationTeamId,
            countryCode,
            organizationLearnerTypeId,
          },
        ];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations: organizationsWithTagsNotExists,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationTagNotFound);
        expect(error.message).to.be.equal("Le tag TagNotFound de l'organisation Mathieu Bâtiment n'existe pas.");
        const organizationsInDB = await knex('organizations').select();
        expect(organizationsInDB).to.have.lengthOf(0);
        const organizationTagsInDB = await knex('organization-tags').select();
        expect(organizationTagsInDB).to.have.lengthOf(0);
      });
    });
  });

  describe('when tags provided are found in database', function () {
    it('should add tags to created organization', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildTag({ name: 'TAG2' });
      databaseBuilder.factory.buildTag({ name: 'TAG3' });
      await databaseBuilder.commit();

      const organizationsWithTagsAlreadyExist = [
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          emailInvitations: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'Tag2_Tag3',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag3',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithTagsAlreadyExist,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(3);
      const organizationTagsInDB = await knex('organization-tags').select();
      expect(organizationTagsInDB).to.have.lengthOf(6);

      for (const organization of organizationsWithTagsAlreadyExist) {
        const organizationInDB = await knex('organizations')
          .first('id', 'externalId', 'name', 'provinceCode', 'credit')
          .where({ externalId: organization.externalId });
        expect(omit(organizationInDB, 'id', 'emailInvitations')).to.be.deep.equal(
          omit(
            organization,
            'locale',
            'tags',
            'type',
            'createdBy',
            'documentationUrl',
            'organizationInvitationRole',
            'emailInvitations',
            'targetProfiles',
            'administrationTeamId',
            'countryCode',
            'organizationLearnerTypeId',
          ),
        );

        const organizationTagInDB = await knex('organization-tags')
          .select()
          .where({ organizationId: organizationInDB.id });
        expect(organizationTagInDB).to.have.lengthOf(2);
      }
    });
  });

  describe('when one provided target profile is not found in database', function () {
    it('should rollback', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      await databaseBuilder.commit();

      const organizationsWithNonExistingTargetProfile = [
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TAG1',
          targetProfiles: '1',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'TAG1',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          emailInvitations: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'TAG1',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
        organizations: organizationsWithNonExistingTargetProfile,
      });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
      expect(error.message).to.be.equal("Le profil cible 1 n'existe pas.");
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(0);
      const organizationTargetProfilesInDB = await knex('target-profile-shares').select();
      expect(organizationTargetProfilesInDB).to.have.lengthOf(0);
    });
  });

  describe('when one provided administration team is not found in database', function () {
    it('should rollback', async function () {
      // given
      const organizationsWithNonExistingAdministrationTeam = [
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
          administrationTeamId: 9999,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
        organizations: organizationsWithNonExistingAdministrationTeam,
      });

      // then
      expect(error).to.be.instanceOf(AdministrationTeamNotFound);
      expect(error.meta).to.deep.equal({
        administrationTeamId: 9999,
      });
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(0);
    });
  });

  describe('when provided administration team is found in database', function () {
    it('should save the organizations', async function () {
      // given
      const anotherAdministrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;
      await databaseBuilder.commit();

      const organizationsWithNonExistingAdministrationTeam = [
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
          administrationTeamId: anotherAdministrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithNonExistingAdministrationTeam,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(2);
      expect(organizationsInDB[0].administrationTeamId).to.equal(administrationTeamId);
      expect(organizationsInDB[1].administrationTeamId).to.equal(anotherAdministrationTeamId);
    });
  });

  describe('when one provided country code is not found in database', function () {
    it('should rollback', async function () {
      // given
      const invalidCountryCode = 99998;
      const organizationsWithNonExistingCountryCode = [
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode: invalidCountryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
        organizations: organizationsWithNonExistingCountryCode,
      });

      // then
      expect(error).to.be.instanceOf(CountryNotFoundError);
      expect(error.meta).to.deep.equal({
        countryCode: invalidCountryCode,
      });
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(0);
    });
  });

  describe('when provided country code is found in database', function () {
    it('should save the organizations', async function () {
      // given
      const organizationsWithExistingCountryCode = [
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithExistingCountryCode,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(1);
      expect(organizationsInDB[0].countryCode).to.equal(Number(countryCode));
    });
  });

  describe('when one provided organization learner type id is not found in database', function () {
    it('should rollback', async function () {
      // given
      const nonExistingOrganizationLearnerTypeId = 5678;

      const organizationsWithOneNonExistingOrganizationLearnerType = [
        {
          type: 'SCO',
          externalId: 'a100',
          name: 'Collège Bob',
          provinceCode: '044',
          credit: 1,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'a200',
          name: 'Thomas Transports',
          provinceCode: '044',
          credit: 1,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId: nonExistingOrganizationLearnerTypeId,
        },
      ];

      // when
      const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
        organizations: organizationsWithOneNonExistingOrganizationLearnerType,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationLearnerTypeNotFound);
      expect(error.meta).to.deep.equal({
        organizationLearnerTypeId: nonExistingOrganizationLearnerTypeId,
      });
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(0);
    });
  });

  describe('when provided organizationLearnerTypeId is found in database', function () {
    it('should save the organizations', async function () {
      // given
      const organizationsWithExistingOrganizationLearnerType = [
        {
          type: 'PRO',
          externalId: 'a200',
          name: 'Thomas Transports',
          provinceCode: '044',
          credit: 1,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'a300',
          name: "Les boulangeries de l'ouest",
          provinceCode: '056',
          credit: 15,
          emailInvitations: '',
          locale: 'fr-fr',
          tags: '',
          targetProfiles: '',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithExistingOrganizationLearnerType,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(2);
      expect(organizationsInDB[0].organizationLearnerTypeId).to.equal(organizationLearnerTypeId);
      expect(organizationsInDB[1].organizationLearnerTypeId).to.equal(organizationLearnerTypeId);
    });
  });

  describe('when target profiles provided are found in database', function () {
    it('should add target profiles to created organization', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildTag({ name: 'TAG2' });
      databaseBuilder.factory.buildTag({ name: 'TAG3' });
      await databaseBuilder.commit();

      const organizationsWithExistingTargetProfiles = [
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          emailInvitations: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'Tag2_Tag3',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          emailInvitations: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag3',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithExistingTargetProfiles,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB).to.have.lengthOf(3);
      const organizationTargetProfilesInDB = await knex('target-profile-shares').select();
      expect(organizationTargetProfilesInDB).to.have.lengthOf(3);

      for (const organization of organizationsWithExistingTargetProfiles) {
        const organizationInDB = await knex('organizations')
          .first('id', 'externalId', 'name', 'provinceCode', 'credit')
          .where({ externalId: organization.externalId });
        expect(omit(organizationInDB, 'id', 'emailInvitations')).to.be.deep.equal(
          omit(
            organization,
            'locale',
            'tags',
            'type',
            'createdBy',
            'documentationUrl',
            'organizationInvitationRole',
            'emailInvitations',
            'targetProfiles',
            'administrationTeamId',
            'countryCode',
            'organizationLearnerTypeId',
          ),
        );

        const organizationTargetProfilesInDB = await knex('target-profile-shares')
          .select()
          .where({ organizationId: organizationInDB.id });
        expect(organizationTargetProfilesInDB).to.have.lengthOf(1);
      }
    });
  });

  describe('when role is specified', function () {
    it('should create organization invitation with role', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildTag({ name: 'TAG2' });
      databaseBuilder.factory.buildTag({ name: 'TAG3' });
      await databaseBuilder.commit();

      const organizationsWithInvitationRole = [
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          emailInvitations: 'andreia@example.net',
          organizationInvitationRole: Membership.roles.MEMBER,
          locale: 'fr-fr',
          tags: 'Tag2_Tag3',
          targetProfiles: '123',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations: organizationsWithInvitationRole,
      });

      // then
      const firstOrganizationInvitation = await knex('organization-invitations')
        .where({ email: organizationsWithInvitationRole[0].emailInvitations })
        .first();
      expect(firstOrganizationInvitation.role).to.be.equal(Membership.roles.ADMIN);
      const secondOrganizationInvitation = await knex('organization-invitations')
        .where({ email: organizationsWithInvitationRole[1].emailInvitations })
        .first();
      expect(secondOrganizationInvitation.role).to.be.equal(Membership.roles.MEMBER);
    });
  });

  describe('when organization type is SCO-1D', function () {
    it('should add mission management, oralization and ONDE import features to organization', async function () {
      // given
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      await databaseBuilder.commit();

      const organizations = [
        {
          type: 'SCO-1D',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          tags: 'TAG1',
          credit: 0,
          emailInvitations: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations,
      });

      // then
      const savedOrganizationFeatures = await knex('organization-features').whereNot({ featureId: byDefaultFeatureId });
      expect(savedOrganizationFeatures).to.have.lengthOf(3);
      const organizationId = createdOrganizations[0].id;
      expect(
        savedOrganizationFeatures.map((organizationFeature) => omit(organizationFeature, 'id')),
      ).to.have.deep.members([
        {
          featureId: oralizationFeature.id,
          params: null,
          organizationId,
        },
        {
          featureId: missionFeature.id,
          params: null,
          organizationId,
        },
        {
          featureId: importStudentsFeature.id,
          params: { organizationLearnerImportFormatId: ondeImportFormat.id },
          organizationId,
        },
      ]);
    });

    it('should create schools associated to organizations', async function () {
      // given
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      await databaseBuilder.commit();

      const organizations = [
        {
          type: 'SCO-1D',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          tags: 'TAG1',
          credit: 0,
          emailForSCOActivation: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'PRO',
          externalId: 'b201',
          name: 'Youness et Fils',
          provinceCode: '123',
          tags: 'TAG1',
          credit: 0,
          emailInvitations: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations,
      });

      // then
      const savedSchools = await knex('schools');
      expect(savedSchools).to.have.lengthOf(1);

      const savedSco1dOrganizations = await knex('organizations').where({ type: 'SCO-1D' });
      expect(savedSco1dOrganizations).to.have.lengthOf(1);
      expect(savedSco1dOrganizations[0].email).to.equal('youness@example.net');

      expect(savedSchools[0].organizationId).to.equal(savedSco1dOrganizations[0].id);
    });
  });

  context('when multiple organizations have the same "externalId"', function () {
    it('adds the organizations with the same "externalId"', async function () {
      // given
      const externalId = 'PIX_EXT_ID';

      databaseBuilder.factory.buildTargetProfile({ id: 123 }).id;
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildOrganization({ type: 'PRO', externalId });
      await databaseBuilder.commit();

      const organizations = [
        {
          type: 'SCO',
          externalId,
          name: 'Lycée René Descartes',
          locale: 'fr-fr',
          createdBy: userId,
          tags: 'TAG1',
          targetProfiles: '123',
          credit: 10,
          provinceCode: '123',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
        {
          type: 'SCO-1D',
          externalId,
          name: 'École Renée Descartes',
          locale: 'fr-fr',
          createdBy: userId,
          tags: 'TAG1',
          targetProfiles: '123',
          credit: 1230,
          provinceCode: '123',
          administrationTeamId,
          countryCode,
          organizationLearnerTypeId,
        },
      ];

      // when
      await usecases.createOrganizationsWithTagsAndTargetProfiles({
        organizations,
      });

      // then
      const createdOrganizations = await knex('organizations').select();
      expect(createdOrganizations).to.have.lengthOf(3);

      const [proOrganization, scoOrganization, sco1dOrganization] = createdOrganizations;
      expect(proOrganization).to.include({ externalId, type: 'PRO' });
      expect(scoOrganization).to.include({ externalId, type: 'SCO' });
      expect(sco1dOrganization).to.include({ externalId, type: 'SCO-1D' });
    });
  });

  describe('when parent organization id is provided', function () {
    describe('when parent organization exists and is not already a child', function () {
      it('should add parent organization id to organization', async function () {
        // given
        const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        const organizations = [
          {
            type: 'SCO',
            externalId: 'ABC',
            name: 'Orga',
            locale: 'fr-fr',
            createdBy: userId,
            administrationTeamId,
            parentOrganizationId,
            countryCode,
            organizationLearnerTypeId,
          },
        ];

        // when
        const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({
          organizations,
        });

        // then
        expect(createdOrganizations[0].parentOrganizationId).to.deep.equal(parentOrganizationId);
      });
    });

    describe('when parent organization does not exist', function () {
      it('should throw', async function () {
        // given
        const organizations = [
          {
            type: 'SCO',
            externalId: 'ABC',
            name: 'Orga',
            locale: 'fr-fr',
            createdBy: userId,
            administrationTeamId,
            parentOrganizationId: 12345,
            countryCode,
            organizationLearnerTypeId,
          },
        ];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    describe('when parent organization is already a child', function () {
      it('should throw', async function () {
        // given
        const grandParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const parentOrganizationId = databaseBuilder.factory.buildOrganization({
          parentOrganizationId: grandParentOrganizationId,
        }).id;

        await databaseBuilder.commit();
        const organizations = [
          {
            type: 'SCO',
            externalId: 'ABC',
            name: 'Orga',
            locale: 'fr-fr',
            createdBy: userId,
            administrationTeamId,
            parentOrganizationId,
            countryCode,
            organizationLearnerTypeId,
          },
        ];

        // when
        const error = await catchErr(usecases.createOrganizationsWithTagsAndTargetProfiles)({
          organizations,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
      });
    });
  });
});
