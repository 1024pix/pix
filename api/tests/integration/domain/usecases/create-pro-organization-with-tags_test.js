const { catchErr, expect, databaseBuilder, knex } = require('../../../test-helper');
const { omit } = require('lodash');

const domainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationTagRepository = require('../../../../lib/infrastructure/repositories/organization-tag-repository');
const tagRepository = require('../../../../lib/infrastructure/repositories/tag-repository');
const { OrganizationTagNotFound, ObjectValidationError, ManyOrganizationsFoundError } = require('../../../../lib/domain/errors');
const createProOrganizationsWithTags = require('../../../../lib/domain/usecases/create-pro-organizations-with-tags');

describe('Integration | UseCases | create-pro-organization', () => {

  beforeEach(async () => {
    databaseBuilder.factory.buildTag({ name: 'TAG1' });
    databaseBuilder.factory.buildTag({ name: 'TAG2' });
    databaseBuilder.factory.buildTag({ name: 'TAG3' });
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('organization-invitations').delete();
    await knex('organization-tags').delete();
    await knex('organizations').delete();

  });

  it('should create pro organizations with tags when tags already exists  ', async () => {
    // given
    const organizationsWithTagsAlreadyExist = [
      { externalId: 'b200', name: 'Youness et Fils', provinceCode: '123', canCollectProfiles: false, credit: 0, email: 'youness@example.net', locale: 'fr-fr', tags: 'Tag1_Tag2' },
      { externalId: 'b300', name: 'Andreia & Co', provinceCode: '345', canCollectProfiles: true, credit: 10, email: 'andreia@example.net', locale: 'fr-fr', tags: 'Tag2_Tag3' },
      { externalId: 'b400', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'Tag1_Tag3' },
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
      const organizationInDB = await knex('organizations').first('id', 'externalId', 'name', 'provinceCode', 'canCollectProfiles', 'credit', 'email').where({ externalId: organization.externalId });
      expect(omit(organizationInDB, 'id')).to.be.deep.equal(omit(organization, 'locale', 'tags'));
      const organizationTagInDB = await knex('organization-tags').select().where({ organizationId: organizationInDB.id });
      expect(organizationTagInDB.length).to.equal(2);

      organizationTagInDB.forEach((value) => {
        expect(value.organizationId).to.be.equal(organizationInDB.id);
      });
    }

  });

  it('should rollback create pro organizations with tags when tags not found', async () => {
    // given
    const organizationsWithTagsNotExists = [
      { externalId: 'b200', name: 'Youness et Fils', provinceCode: '123', canCollectProfiles: false, credit: 0, email: 'youness@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b300', name: 'Andreia & Co', provinceCode: '345', canCollectProfiles: true, credit: 10, email: 'andreia@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b400', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
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
    expect(error.message).to.be.equal('Le tag de l’organization n’existe pas.');
    const organizationsInDB = await knex('organizations').select();
    expect(organizationsInDB.length).to.equal(0);
    const organizationTagsInDB = await knex('organization-tags').select();
    expect(organizationTagsInDB.length).to.equal(0);

  });

  it('should rollback create pro organizations with tags and throw an error when an externalId is missing', async () => {
    //given
    const organizationsWithTagsWithOneMissingExternalId = [
      { externalId: 'b200', name: 'Youness et Fils', provinceCode: '123', canCollectProfiles: false, credit: 0, email: 'youness@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: '', name: 'Andreia & Co', provinceCode: '345', canCollectProfiles: true, credit: 10, email: 'andreia@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b201', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
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
    expect(error).to.be.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equal('L’externalId de l’organisation n’est pas présent.');
    const organizationsInDB = await knex('organizations').select();
    expect(organizationsInDB.length).to.equal(0);
    const organizationTagsInDB = await knex('organization-tags').select();
    expect(organizationTagsInDB.length).to.equal(0);

  });

  it('should rollback create pro organizations with tags and throw an error when an organization name is missing', async () => {
    // given
    const organizationsWithTagsWithOneMissingName = [
      { externalId: 'b200', name: 'Youness et Fils', provinceCode: '123', canCollectProfiles: false, credit: 0, email: 'youness@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b201', name: '', provinceCode: '345', canCollectProfiles: true, credit: 10, email: 'andreia@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b202', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
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
    expect(error).to.be.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equal('Le nom de l’organisation n’est pas présent.');
    const organizationsInDB = await knex('organizations').select();
    expect(organizationsInDB.length).to.equal(0);
    const organizationTagsInDB = await knex('organization-tags').select();
    expect(organizationTagsInDB.length).to.equal(0);

  });

  it('should rollback create pro organizations with tags and throw an error when there is more than one occurrence of the same organization', async () => {
    // given
    const tooManyOccurencesOfTheSameorganizationWithTags = [
      { externalId: 'b200', name: 'Youness et Fils', provinceCode: '123', canCollectProfiles: false, credit: 0, email: 'youness@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b202', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
      { externalId: 'b202', name: 'Mathieu Bâtiment', provinceCode: '567', canCollectProfiles: false, credit: 20, email: 'mathieu@example.net', locale: 'fr-fr', tags: 'TagNotFound' },
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
    const organizationsInDB = await knex('organizations').select();
    expect(organizationsInDB.length).to.equal(0);
    const organizationTagsInDB = await knex('organization-tags').select();
    expect(organizationTagsInDB.length).to.equal(0);

  });

});
