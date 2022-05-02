const { catchErr, expect, databaseBuilder, knex } = require('../../../test-helper');
const { omit } = require('lodash');

const domainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../../../../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../../../../lib/infrastructure/repositories/tag-repository');
const {
  OrganizationTagNotFound,
  ManyOrganizationsFoundError,
  OrganizationAlreadyExistError,
  EntityValidationError,
  ObjectValidationError,
} = require('../../../../lib/domain/errors');
const createProOrganizationsWithTags = require('../../../../lib/domain/usecases/create-pro-organizations-with-tags');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Integration | UseCases | create-pro-organization', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('organization-invitations').delete();
    await knex('organization-tags').delete();
    await knex('organizations').delete();
    await knex('users').delete();
  });

  describe('validation error cases', function () {
    it('should throw an error when there is more than one occurrence of the same organization in data file', async function () {
      // given
      const tooManyOccurencesOfTheSameorganizationWithTags = [
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
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: tooManyOccurencesOfTheSameorganizationWithTags,
        organizationRepository,
        tagRepository,
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
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations,
        organizationRepository,
        tagRepository,
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
          externalId: existingOrganization.externalId,
          name: existingOrganization.name,
          provinceCode: existingOrganization.provinceCode,
          credit: existingOrganization.credit,
          email: existingOrganization.email,
          locale: 'en',
          tags: 'Tag1',
          documentationUrl: 'http://www.pix.fr',
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: anotherExistingOrganization.externalId,
          name: anotherExistingOrganization.name,
          provinceCode: anotherExistingOrganization.provinceCode,
          credit: anotherExistingOrganization.credit,
          email: anotherExistingOrganization.email,
          type: anotherExistingOrganization.type,
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
          locale: 'en',
          tags: 'Tag1',
          documentationUrl: 'http://www.pix.fr',
        },
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          createdBy: userId,
          organizationInvitationRole: 'ADMIN',
          documentationUrl: 'http://www.pix.fr',
        },
      ];

      // when
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: organizationsToCreate,
        organizationRepository,
        tagRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationAlreadyExistError);
      expect(error.message).to.be.equal(
        `Les organisations avec les externalIds suivants : ${existingOrganization.externalId}, ${anotherExistingOrganization.externalId} existent déjà.`
      );
    });

    it('should throw an error when required value are missing excepting for provinceCode that is optionnal', async function () {
      //given
      const organizationsWithTagsWithOneMissingExternalId = [
        {
          externalId: '',
          name: '',
          provinceCode: '',
          credit: '',
          email: '',
          locale: '',
          tags: '',
          createdBy: '',
          documentationUrl: '',
          organizationInvitationRole: '',
        },
      ];

      // when
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: organizationsWithTagsWithOneMissingExternalId,
        organizationRepository,
        tagRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.eql([
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
          message: "Le crédit n'est pas renseigné.",
        },
        {
          attribute: 'email',
          message: "L'email n’est pas renseigné.",
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
      ]);
    });

    it('should throw an error when first error found whend an externalId is missing and email is not valid', async function () {
      //given
      const organizationsWithTagsWithOneMissingExternalId = [
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: '',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          email: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: 'b201',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
      ];

      // when
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: organizationsWithTagsWithOneMissingExternalId,
        organizationRepository,
        tagRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.eql([
        {
          attribute: 'email',
          message: "L'email fourni n'est pas valide.",
        },
      ]);
    });

    it('should throw an error when an organization name is missing', async function () {
      // given
      const organizationsWithTagsWithOneMissingName = [
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
        },
        {
          externalId: 'b201',
          name: '',
          provinceCode: '345',
          credit: 10,
          email: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
        },
        {
          externalId: 'b202',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
        },
      ];

      // when
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: organizationsWithTagsWithOneMissingName,
        organizationRepository,
        tagRepository,
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
    it('should rollback create pro organizations with tags', async function () {
      // given
      const organizationsWithTagsNotExists = [
        {
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound_AnotherTagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'TagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'MEMBER',
        },
        {
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          email: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'AnotherTagNotFound',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
      ];

      // when
      const error = await catchErr(createProOrganizationsWithTags)({
        domainTransaction,
        organizations: organizationsWithTagsNotExists,
        organizationRepository,
        tagRepository,
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
    it('should create pro organizations with tags', async function () {
      // given
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildTag({ name: 'TAG2' });
      databaseBuilder.factory.buildTag({ name: 'TAG3' });
      await databaseBuilder.commit();

      const organizationsWithTagsAlreadyExist = [
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          email: 'andreia@example.net',
          locale: 'fr-fr',
          tags: 'Tag2_Tag3',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
        {
          externalId: 'b400',
          name: 'Mathieu Bâtiment',
          provinceCode: '567',
          credit: 20,
          email: 'mathieu@example.net',
          locale: 'fr-fr',
          tags: 'Tag1_Tag3',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
          organizationInvitationRole: 'ADMIN',
        },
      ];

      // when
      await createProOrganizationsWithTags({
        domainTransaction,
        organizations: organizationsWithTagsAlreadyExist,
        organizationRepository,
        tagRepository,
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
          .first('id', 'externalId', 'name', 'provinceCode', 'credit', 'email')
          .where({ externalId: organization.externalId });
        expect(omit(organizationInDB, 'id')).to.be.deep.equal(
          omit(organization, 'locale', 'tags', 'type', 'createdBy', 'documentationUrl', 'organizationInvitationRole')
        );

        const organizationTagInDB = await knex('organization-tags')
          .select()
          .where({ organizationId: organizationInDB.id });
        expect(organizationTagInDB.length).to.equal(2);

        organizationTagInDB.forEach((value) => {
          expect(value.organizationId).to.be.equal(organizationInDB.id);
        });
      }
    });
  });

  describe('when role is specified', function () {
    it('should create organization invitation with role', async function () {
      // given
      databaseBuilder.factory.buildTag({ name: 'TAG1' });
      databaseBuilder.factory.buildTag({ name: 'TAG2' });
      databaseBuilder.factory.buildTag({ name: 'TAG3' });
      await databaseBuilder.commit();

      const organizationsWithInvitationRole = [
        {
          externalId: 'b200',
          name: 'Youness et Fils',
          provinceCode: '123',
          credit: 0,
          email: 'youness@example.net',
          organizationInvitationRole: Membership.roles.ADMIN,
          locale: 'fr-fr',
          tags: 'Tag1_Tag2',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
        },
        {
          externalId: 'b300',
          name: 'Andreia & Co',
          provinceCode: '345',
          credit: 10,
          email: 'andreia@example.net',
          organizationInvitationRole: Membership.roles.MEMBER,
          locale: 'fr-fr',
          tags: 'Tag2_Tag3',
          createdBy: userId,
          documentationUrl: 'http://www.pix.fr',
        },
      ];

      // when
      await createProOrganizationsWithTags({
        domainTransaction,
        organizations: organizationsWithInvitationRole,
        organizationRepository,
        tagRepository,
        organizationTagRepository,
        organizationInvitationRepository,
      });

      // then
      const firstOrganizationInvitation = await knex('organization-invitations')
        .where({ email: organizationsWithInvitationRole[0].email })
        .first();
      expect(firstOrganizationInvitation.role).to.be.equal(Membership.roles.ADMIN);
      const secondOrganizationInvitation = await knex('organization-invitations')
        .where({ email: organizationsWithInvitationRole[1].email })
        .first();
      expect(secondOrganizationInvitation.role).to.be.equal(Membership.roles.MEMBER);
    });
  });
});
