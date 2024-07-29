import * as organizationTagRepository from '../../../../../lib/infrastructure/repositories/organization-tag-repository.js';
import { OrganizationNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { TagNotFoundError } from '../../../../../src/organizational-entities/domain/errors.js';
import { addTagsToOrganizations } from '../../../../../src/organizational-entities/domain/usecases/add-tags-to-organizations.usecase.js';
import { organizationForAdminRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import { tagRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Domain | UseCase | add-tags-to-organizations', function () {
  let firstTag;
  let secondTag;
  let thirdTag;
  let firstOrganizationId;
  let secondOrganizationId;

  beforeEach(function () {
    firstTag = databaseBuilder.factory.buildTag({ name: 'tag1' });
    secondTag = databaseBuilder.factory.buildTag({ name: 'tag2' });
    thirdTag = databaseBuilder.factory.buildTag({ name: 'tag3' });

    firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    secondOrganizationId = databaseBuilder.factory.buildOrganization().id;

    return databaseBuilder.commit();
  });

  describe('when a tag name does not exist', function () {
    it('throws a TagNotFoundError', async function () {
      // given
      const unknownTagName = 'unknown_tag_name';
      const organizationTags = [{ organizationId: firstOrganizationId, tagName: unknownTagName }];

      // when
      const error = await catchErr(addTagsToOrganizations)({
        organizationTags,
        organizationTagRepository,
        tagRepository,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(TagNotFoundError);
      expect(error).to.deep.include({
        code: 'TAG_NOT_FOUND',
        meta: { tagName: unknownTagName },
      });
    });
  });

  describe('when an organization ID does not exist', function () {
    it('throws an OrganizationNotFound', async function () {
      // given
      const unknownOrganizationId = 1;
      const organizationTags = [{ organizationId: unknownOrganizationId, tagName: firstTag.name }];

      // when
      const error = await catchErr(addTagsToOrganizations)({
        organizationTags,
        organizationTagRepository,
        tagRepository,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(OrganizationNotFound);
      expect(error).to.deep.include({
        code: 'ORGANIZATION_NOT_FOUND',
        meta: { organizationId: unknownOrganizationId },
      });
    });
  });

  describe('when tags and organizations exist', function () {
    describe('when instructing to add not already associated tags to an organization', function () {
      it('adds tags to organizations', async function () {
        // given
        const organizationTags = [
          { organizationId: firstOrganizationId, tagName: firstTag.name },
          { organizationId: secondOrganizationId, tagName: secondTag.name },
          { organizationId: secondOrganizationId, tagName: thirdTag.name },
        ];

        // when
        await addTagsToOrganizations({
          organizationTags,
          organizationTagRepository,
          tagRepository,
          organizationForAdminRepository,
        });

        // then
        const organizationTagsInDB = await knex('organization-tags');
        expect(organizationTagsInDB.length).to.equal(3);
        expect(await knex('organization-tags').where({ organizationId: firstOrganizationId, tagId: firstTag.id })).to
          .exist;
        expect(await knex('organization-tags').where({ organizationId: secondOrganizationId, tagId: secondTag.id })).to
          .exist;
        expect(await knex('organization-tags').where({ organizationId: secondOrganizationId, tagId: thirdTag.id })).to
          .exist;
      });
    });

    describe('when instructing to add already associated tags to an organization', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganizationTag({ organizationId: firstOrganizationId, tagId: firstTag.id });
        return databaseBuilder.commit();
      });

      it('adds tags to organizations without throwing an error', async function () {
        // given
        const organizationTags = [{ organizationId: firstOrganizationId, tagName: firstTag.name }];

        // when
        // then
        await addTagsToOrganizations({
          organizationTags,
          organizationTagRepository,
          tagRepository,
          organizationForAdminRepository,
        });
      });
    });
  });
});
