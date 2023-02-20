import { expect, knex, domainBuilder, databaseBuilder, catchErr } from '../../../test-helper';
import OrganizationTag from '../../../../lib/domain/models/OrganizationTag';
import { AlreadyExistingEntityError, OrganizationTagNotFound } from '../../../../lib/domain/errors';
import organizationTagRepository from '../../../../lib/infrastructure/repositories/organization-tag-repository';
import omit from 'lodash/omit';
import BookshelfOrganizationTag from '../../../../lib/infrastructure/orm-models/OrganizationTag';

describe('Integration | Repository | OrganizationTagRepository', function () {
  describe('#create', function () {
    afterEach(async function () {
      await knex('organization-tags').delete();
    });

    it('should create an OrganizationTag', async function () {
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

    context('when an organization tag already exist', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
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

  describe('#delete', function () {
    it('should delete an organization tag', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;
      const otherTagId = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' }).id;
      const organizationTagToBeDeleteId = databaseBuilder.factory.buildOrganizationTag({
        organizationId,
        tagId,
      }).id;
      databaseBuilder.factory.buildOrganizationTag({
        organizationId,
        tagId: otherTagId,
      });
      await databaseBuilder.commit();

      // when
      await organizationTagRepository.delete({ organizationTagId: organizationTagToBeDeleteId });

      // then
      const nbOrganizationTagAfterDeletion = await BookshelfOrganizationTag.count();
      expect(nbOrganizationTagAfterDeletion).to.equal(1);
    });

    context('when organization tag does not exist', function () {
      it('should throw an OrganizationTagNotFound', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const tagId = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;
        const organizationTagId = databaseBuilder.factory.buildOrganizationTag({
          organizationId,
          tagId,
        }).id;
        await databaseBuilder.commit();

        // when
        const inexistingOranizationTagId = organizationTagId + 1;
        const error = await catchErr(organizationTagRepository.delete)({
          organizationTagId: inexistingOranizationTagId,
        });

        // then
        expect(error).to.be.an.instanceof(OrganizationTagNotFound);
        expect(error.message).to.be.equal('An error occurred while deleting the organization tag');
      });
    });
  });

  describe('#findOneByOrganizationIdAndTagId', function () {
    it('should find the first matching organization tag', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;
      const organizationTagInDatabase = databaseBuilder.factory.buildOrganizationTag({
        organizationId,
        tagId,
      });
      await databaseBuilder.commit();

      // when
      const organizationTagFound = await organizationTagRepository.findOneByOrganizationIdAndTagId({
        organizationId,
        tagId,
      });

      // then
      expect(organizationTagFound).to.deep.equal(organizationTagInDatabase);
    });

    it('should not throw an error and return empty array if there is no matching organization tag', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;
      await databaseBuilder.commit();

      // when
      const result = await organizationTagRepository.findOneByOrganizationIdAndTagId({
        organizationId,
        tagId: tagId + 1,
      });

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#isExistingByOrganizationIdAndTagId', function () {
    it('should return true if organization tag exists', async function () {
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

    it('should return false if organization tag does not exist', async function () {
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

  describe('#batchCreate', function () {
    afterEach(async function () {
      await knex('organization-tags').delete();
    });

    it('should add rows in the table "organizations-tags"', async function () {
      // given
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;

      const tagId1 = databaseBuilder.factory.buildTag({ name: 'tag1' }).id;
      const tagId2 = databaseBuilder.factory.buildTag({ name: 'tag2' }).id;

      await databaseBuilder.commit();

      const organizationTag1 = domainBuilder.buildOrganizationTag({ organizationId: organizationId1, tagId: tagId1 });
      const organizationTag2 = domainBuilder.buildOrganizationTag({ organizationId: organizationId2, tagId: tagId2 });
      organizationTag1.id = undefined;
      organizationTag2.id = undefined;

      // when
      await organizationTagRepository.batchCreate([organizationTag1, organizationTag2]);

      // then
      const foundOrganizations = await knex('organization-tags').select();
      expect(foundOrganizations.length).to.equal(2);
    });
  });
});
