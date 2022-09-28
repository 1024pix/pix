const { catchErr, expect, databaseBuilder, knex } = require('../../../test-helper');
const { omit } = require('lodash');

const domainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../../../../lib/infrastructure/repositories/organization-tag-repository');
const targetProfileShareRepository = require('../../../../lib/infrastructure/repositories/target-profile-share-repository');
const tagRepository = require('../../../../lib/infrastructure/repositories/tag-repository');
const {
  OrganizationTagNotFound,
  ManyOrganizationsFoundError,
  OrganizationAlreadyExistError,
  EntityValidationError,
  ObjectValidationError,
  TargetProfileInvalidError,
} = require('../../../../lib/domain/errors');
const createOrganizationsWithTagsAndTargetProfiles = require('../../../../lib/domain/usecases/create-organizations-with-tags-and-target-profiles');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Integration | UseCases | create-organizations-with-tags-and-target-profiles', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('organization-invitations').delete();
    await knex('organization-tags').delete();
    await knex('target-profile-shares').delete();
    await knex('organizations').delete();
    await knex('users').delete();
  });

  describe('validation error cases', function () {
    it('should throw an error when there is more than one occurrence of the same organization in data file', async function () {
      // given
      const tooManyOccurencesOfTheSameOrganizationWithTags = [
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
        },
        {
          externalId: 'b202',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
        },
        {
          externalId: 'b202',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
        },
      ];

      // when
      const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
        domainTransaction,
        organizations: tooManyOccurencesOfTheSameOrganizationWithTags,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(ManyOrganizationsFoundError);
      expect(error.message).to.be.equal('Une organisation apparaît plusieurs fois.');
    });

    it('should throw an error when there is organizations data file is empty', async function () {
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
      });

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
      expect(error.message).to.be.equal('Les organisations ne sont pas renseignées.');
    });

    it('should throw an error with id when there is one organizations already created', async function () {
      // given
      const existingOrganization = databaseBuilder.factory.buildOrganization({
        externalId: 'ExaB123',
        createdBy: userId,
      });
      const anotherExistingOrganization = databaseBuilder.factory.buildOrganization({
        externalId: 'ExaB1234',
        createdBy: userId,
      });
      databaseBuilder.factory.buildOrganization({ externalId: 'ExaB12345', createdBy: userId });
      await databaseBuilder.commit();

      const organizationsToCreate = [
        {
          type: 'PRO',
          externalId: existingOrganization.externalId,
          name: existingOrganization.name,
          provinceCode: existingOrganization.provinceCode,
          credit: existingOrganization.credit,
          emailInvitations: existingOrganization.email,
          locale: 'en',
          tags: 'Tag1',
          documentationUrl: 'http://www.pix.fr',
          targetProfiles: '1_2_3',
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: anotherExistingOrganization.externalId,
          name: anotherExistingOrganization.name,
          provinceCode: anotherExistingOrganization.provinceCode,
          credit: anotherExistingOrganization.credit,
          emailInvitations: anotherExistingOrganization.email,
          type: anotherExistingOrganization.type,
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
          locale: 'en',
          tags: 'Tag1',
          documentationUrl: 'http://www.pix.fr',
          targetProfiles: '1_2_3',
        },
        {
          type: 'PRO',
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          emailInvitations: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
          documentationUrl: 'http://www.pix.fr',
          targetProfiles: '1_2_3',
        },
      ];

      // when
      const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
        domainTransaction,
        organizations: organizationsToCreate,
        organizationRepository,
        tagRepository,
        targetProfileShareRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationAlreadyExistError);
      expect(error.message).to.be.equal(
        `Les organisations avec les externalIds suivants : ${existingOrganization.externalId}, ${anotherExistingOrganization.externalId} existent déjà.`
      );
    });

    it('should throw an error when required value are missing', async function () {
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
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.eql([
        {
          attribute: 'type',
          message: "Le type fourni doit avoir l'une des valeurs suivantes : SCO,SUP,PRO",
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
          attribute: 'tags',
          message: 'Les tags ne sont pas renseignés.',
        },
        {
          attribute: 'documentationUrl',
          message: "L'url de documentation n'est pas renseignée.",
        },
        {
          attribute: 'locale',
          message: "La locale doit avoir l'une des valeurs suivantes : fr-fr, fr ou en",
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
          attribute: 'organizationInvitationRole',
          message: "Le rôle fourni doit avoir l'une des valeurs suivantes : ADMIN ou MEMBER",
        },
        {
          attribute: 'organizationInvitationRole',
          message: 'Le rôle n’est pas renseigné.',
        },
        {
          attribute: 'createdBy',
          message: "L'id du créateur doit être un nombre",
        },
        {
          attribute: 'targetProfiles',
          message: 'Les profiles cibles ne sont pas renseignés.',
        },
      ]);
    });

    it('should throw an error when first error found when an externalId is missing and email is not valid', async function () {
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

    it('should throw an error when an organization name is missing', async function () {
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
            'targetProfiles'
          )
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
            'targetProfiles'
          )
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
});
