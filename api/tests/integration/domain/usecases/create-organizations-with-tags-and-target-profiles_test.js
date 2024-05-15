import lodash from 'lodash';

import {
  ObjectValidationError,
  OrganizationTagNotFound,
  TargetProfileInvalidError,
} from '../../../../lib/domain/errors.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import * as organizationInvitationService from '../../../../lib/domain/services/organization-invitation-service.js';
import { createOrganizationsWithTagsAndTargetProfiles } from '../../../../lib/domain/usecases/create-organizations-with-tags-and-target-profiles.js';
import * as organizationValidator from '../../../../lib/domain/validators/organization-with-tags-and-target-profiles-script.js';
import { DomainTransaction as domainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import * as dataProtectionOfficerRepository from '../../../../lib/infrastructure/repositories/data-protection-officer-repository.js';
import * as organizationInvitationRepository from '../../../../lib/infrastructure/repositories/organization-invitation-repository.js';
import * as organizationTagRepository from '../../../../lib/infrastructure/repositories/organization-tag-repository.js';
import * as tagRepository from '../../../../lib/infrastructure/repositories/tag-repository.js';
import * as targetProfileShareRepository from '../../../../lib/infrastructure/repositories/target-profile-share-repository.js';
import * as schoolRepository from '../../../../src/school/infrastructure/repositories/school-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import * as organizationRepository from '../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

const { omit } = lodash;

describe('Integration | UseCases | create-organizations-with-tags-and-target-profiles', function () {
  let missionFeature;
  let learnerImportFeature;
  let userId;

  beforeEach(async function () {
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
    missionFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT);
    learnerImportFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#errors', function () {
    context('when provided CSV file is empty', function () {
      it('throws an error', async function () {
        // given
        const organizations = [];

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations,
          organizationRepository,
          tagRepository,
          targetProfileShareRepository,
          organizationTagRepository,
          organizationInvitationRepository,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
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
            createdBy: '',
            documentationUrl: '',
            targetProfiles: '',
            organizationInvitationRole: '',
          },
        ];

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: organizationsWithEmptyValues,
          organizationRepository,
          tagRepository,
          targetProfileShareRepository,
          organizationTagRepository,
          organizationInvitationRepository,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
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
            message: "La locale doit avoir l'une des valeurs suivantes : en, es, fr, fr-be, fr-fr, nl-be",
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
          },
        ];

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: organizationsWithTagsWithOneMissingExternalId,
          organizationRepository,
          tagRepository,
          targetProfileShareRepository,
          organizationTagRepository,
          organizationInvitationRepository,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
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

    context('when an organization name is missing', function () {
      it('throws an error', async function () {
        // given
        const organizationsWithTagsWithOneMissingName = [
          {
            type: 'PRO',
            externalId: 'b200',
            name: 'Youness et Fils',
            provinceCode: '123',
            credit: 0,
            emailInvitations: 'youness@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'MEMBER',
          },
          {
            type: 'PRO',
            externalId: 'b201',
            name: '',
            provinceCode: '345',
            credit: 10,
            emailInvitations: 'andreia@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'MEMBER',
          },
          {
            type: 'PRO',
            externalId: 'b202',
            name: 'Mathieu Bâtiment',
            provinceCode: '567',
            credit: 20,
            emailInvitations: 'mathieu@example.net',
            locale: 'fr-fr',
            tags: 'TagNotFound',
            createdBy: userId,
            documentationUrl: 'http://www.pix.fr',
            targetProfiles: '1_2_3',
            organizationInvitationRole: 'MEMBER',
          },
        ];

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: organizationsWithTagsWithOneMissingName,
          organizationRepository,
          tagRepository,
          targetProfileShareRepository,
          organizationTagRepository,
          organizationInvitationRepository,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.eql([
          {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.',
          },
        ]);
      });
    });

    describe('when one provided tag is not found in database', function () {
      it('should rollback', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
          },
        ];

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: organizationsWithTagsNotExists,
          organizationRepository,
          tagRepository,
          targetProfileShareRepository,
          organizationTagRepository,
          organizationInvitationRepository,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationTagNotFound);
        expect(error.message).to.be.equal("Le tag TagNotFound de l'organisation Mathieu Bâtiment n'existe pas.");
        const organizationsInDB = await knex('organizations').select();
        expect(organizationsInDB.length).to.equal(0);
        const organizationTagsInDB = await knex('organization-tags').select();
        expect(organizationTagsInDB.length).to.equal(0);
      });
    });
  });

  describe('when tags provided are found in database', function () {
    it('should add tags to created organization', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations: organizationsWithTagsAlreadyExist,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB.length).to.equal(3);
      const organizationTagsInDB = await knex('organization-tags').select();
      expect(organizationTagsInDB.length).to.equal(6);

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
          ),
        );

        const organizationTagInDB = await knex('organization-tags')
          .select()
          .where({ organizationId: organizationInDB.id });
        expect(organizationTagInDB.length).to.equal(2);
      }
    });
  });

  describe('when one provided target profile is not found in database', function () {
    it('should rollback', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
        },
      ];

      // when
      const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
        domainTransaction,
        organizations: organizationsWithNonExistingTargetProfile,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
      });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
      expect(error.message).to.be.equal("Le profil cible 1 n'existe pas.");
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB.length).to.equal(0);
      const organizationTargetProfilesInDB = await knex('target-profile-shares').select();
      expect(organizationTargetProfilesInDB.length).to.equal(0);
    });
  });

  describe('when target profiles provided are found in database', function () {
    it('should add target profiles to created organization', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations: organizationsWithExistingTargetProfiles,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
      });

      // then
      const organizationsInDB = await knex('organizations').select();
      expect(organizationsInDB.length).to.equal(3);
      const organizationTargetProfilesInDB = await knex('target-profile-shares').select();
      expect(organizationTargetProfilesInDB.length).to.equal(3);

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
          ),
        );

        const organizationTargetProfilesInDB = await knex('target-profile-shares')
          .select()
          .where({ organizationId: organizationInDB.id });
        expect(organizationTargetProfilesInDB.length).to.equal(1);
      }
    });
  });

  describe('when role is specified', function () {
    it('should create organization invitation with role', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations: organizationsWithInvitationRole,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
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
    it('should add mission management feature to organization', async function () {
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
        schoolRepository,
      });

      // then
      const savedOrganizationFeatures = await knex('organization-features');
      expect(savedOrganizationFeatures.length).to.equal(2);
      const savedOrganizationFeatureIds = savedOrganizationFeatures.map(
        (organizationFeature) => organizationFeature.featureId,
      );
      expect(savedOrganizationFeatureIds).to.include(missionFeature.id);
      expect(savedOrganizationFeatureIds).to.include(learnerImportFeature.id);
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
          emailInvitations: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
        schoolRepository,
      });

      // then
      const savedSchools = await knex('schools');
      expect(savedSchools.length).to.equal(1);

      const savedSco1dOrganizations = await knex('organizations').where({ type: 'SCO-1D' });
      expect(savedSco1dOrganizations.length).to.equal(1);

      expect(savedSchools[0].organizationId).to.equal(savedSco1dOrganizations[0].id);
    });
  });

  context('when multiple organizations have the same "externalId"', function () {
    it('adds the organizations with the same "externalId"', async function () {
      // given
      const externalId = 'PIX_EXT_ID';

      databaseBuilder.factory.buildTargetProfile({ id: 123, ownerOrganizationId: null }).id;
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
        },
      ];

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
        dataProtectionOfficerRepository,
        organizationValidator,
        organizationInvitationService,
        schoolRepository,
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
});
