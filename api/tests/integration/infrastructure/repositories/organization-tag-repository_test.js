const { expect, knex, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');
const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');
const organizationTagRepository = require('../../../../lib/infrastructure/repositories/organization-tag-repository');
const omit = require('lodash/omit');

describe('Integration | Repository | OrganizationTagRepository', function() {

  describe('#create', function() {

    afterEach(async function() {
      await knex('organization-tags').delete();
    });

    it('should create an OrganizationTag', async function() {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag().id;
      await databaseBuilder.commit();
      const organizationTag = domainBuilder.buildOrganizationTag({ organizationId, tagId });

      // when
      const createdOrganizationTag = await organizationTagRepository.create(organizationTag);

      // then
      expect(createdOrganizationTag).to.be.instanceOf(OrganizationTag);
      expect(omit(createdOrganizationTag, 'id')).to.deep.equal(omit(organizationTag, 'id'));
    });

    context('when an organization tag already exist', function() {

      it('should throw an AlreadyExistingEntityError', async function() {
        // given
        const existingOrganizationTag = databaseBuilder.factory.buildOrganizationTag();
        await databaseBuilder.commit();

        // when
        const error = await catchErr(organizationTagRepository.create)({
          organizationId: existingOrganizationTag.organizationId,
          tagId: existingOrganizationTag.tagId,
        });

        // then
        expect(error).to.be.an.instanceof(AlreadyExistingEntityError);
      });
    });
  });

  describe('#isExistingByOrganizationIdAndTagId', function() {

    it('should return true if organization tag exists', async function() {
      // given
      const existingOrganizationTag = databaseBuilder.factory.buildOrganizationTag();
      await databaseBuilder.commit();

      // when
      const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({
        organizationId: existingOrganizationTag.organizationId,
        tagId: existingOrganizationTag.tagId,
      });

      // then
      expect(isExisting).to.be.true;
    });

    it('should return false if organization tag does not exist', async function() {
      // given
      const notExistingId = 1234;

      // when
      const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({
        organizationId: notExistingId,
        tagId: notExistingId,
      });

      // then
      expect(isExisting).to.be.false;
    });
  });

});
