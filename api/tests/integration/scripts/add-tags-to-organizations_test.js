const { expect, databaseBuilder, knex, catchErr } = require('../../test-helper');
const { retrieveTagsByName, addTagsToOrganizations } = require('../../../scripts/add-tags-to-organizations');

describe('Integration | Scripts | add-tags-to-organizations.js', () => {

  let firstTag;
  let secondTag;
  let thirdTag;

  beforeEach(() => {
    firstTag = databaseBuilder.factory.buildTag({ name: 'tag1' });
    secondTag = databaseBuilder.factory.buildTag({ name: 'tag2' });
    thirdTag = databaseBuilder.factory.buildTag({ name: 'tag3' });

    return databaseBuilder.commit();
  });

  describe('#retrieveTagsByName', () => {

    it('should retrieve tags by tag name', async () => {
      // given
      const checkedData = [
        { organizationId: 1, tagName: firstTag.name },
        { organizationId: 2, tagName: secondTag.name },
        { organizationId: 3, tagName: firstTag.name },
        { organizationId: 4, tagName: thirdTag.name },
        { organizationId: 5, tagName: secondTag.name },
      ];

      // when
      const tagsByName = await retrieveTagsByName({ checkedData });

      // then
      expect(tagsByName.size).to.equal(3);
      expect(tagsByName.get(firstTag.name)).to.deep.equal(firstTag);
      expect(tagsByName.get(secondTag.name)).to.deep.equal(secondTag);
      expect(tagsByName.get(thirdTag.name)).to.deep.equal(thirdTag);
    });

    it('should throw an error if tag does not exist', async () => {
      // given
      const tagName = 'unknown_tag_name';
      const checkedData = [
        { organizationId: 1, tagName },
      ];

      // when
      const error = await catchErr(retrieveTagsByName)({ checkedData });

      // then
      expect(error.message).to.equal(`The tag with name ${tagName} does not exist.`);
    });

  });

  describe('#addTagsToOrganizations', () => {

    let firstOrganizationId;
    let secondOrganizationId;
    let thirdOrganizationId;

    beforeEach(() => {
      firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
      secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
      thirdOrganizationId = databaseBuilder.factory.buildOrganization().id;

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('organization-tags').delete();
    });

    it('should add tags to organizations', async () => {
      // given
      const tagsByName = new Map([
        [firstTag.name, firstTag],
        [secondTag.name, secondTag],
        [thirdTag.name, thirdTag],
      ]);

      const checkedData = [
        { organizationId: firstOrganizationId, tagName: firstTag.name },
        { organizationId: secondOrganizationId, tagName: secondTag.name },
        { organizationId: thirdOrganizationId, tagName: thirdTag.name },
      ];

      // when
      await addTagsToOrganizations({ tagsByName, checkedData });

      // then
      const organizationTagsInDB = await knex('organization-tags');
      expect(organizationTagsInDB.length).to.equal(3);
      expect(await knex('organization-tags').where({ organizationId: firstOrganizationId, tagId: firstTag.id })).to.exist;
      expect(await knex('organization-tags').where({ organizationId: secondOrganizationId, tagId: secondTag.id })).to.exist;
      expect(await knex('organization-tags').where({ organizationId: thirdOrganizationId, tagId: thirdTag.id })).to.exist;
    });

    context('When tag already exists for an organization', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganizationTag({ organizationId: firstOrganizationId, tagId: firstTag.id });
        return databaseBuilder.commit();
      });

      it('should not throw an error', async () => {
        // given
        const tagsByName = new Map([
          [firstTag.name, firstTag],
        ]);

        const checkedData = [
          { organizationId: firstOrganizationId, tagName: firstTag.name },
        ];

        // when
        await addTagsToOrganizations({ tagsByName, checkedData });

        // then
        expect(true).to.be.true;
      });
    });
  });
});
