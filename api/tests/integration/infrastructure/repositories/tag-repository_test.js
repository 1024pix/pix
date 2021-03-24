const { expect, knex, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const Tag = require('../../../../lib/domain/models/Tag');
const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');
const tagRepository = require('../../../../lib/infrastructure/repositories/tag-repository');

describe('Integration | Repository | TagRepository', function() {

  describe('#create', function() {

    afterEach(async function() {
      await knex('tags').delete();
    });

    it('should create a Tag', async function() {
      // given
      const tag = domainBuilder.buildTag({ name: 'A Tag' });

      // when
      const createdTag = await tagRepository.create(tag);

      // then
      expect(createdTag).to.be.instanceOf(Tag);
      expect(createdTag.name).to.equal(tag.name);
    });

    context('when a tag name already exist', function() {

      it('should throw an AlreadyExistingEntityError', async function() {
        // given
        const existingTag = databaseBuilder.factory.buildTag();
        await databaseBuilder.commit();

        // when
        const error = await catchErr(tagRepository.create)({ name: existingTag.name });

        // then
        expect(error).to.be.an.instanceof(AlreadyExistingEntityError);
      });
    });
  });

  describe('#findByName', function() {

    it('should return the tag if it exists', async function() {
      // given
      const tagName = 'A Tag';
      databaseBuilder.factory.buildTag({ name: tagName });
      await databaseBuilder.commit();

      // when
      const result = await tagRepository.findByName({ name: tagName });

      // then
      expect(result.name).to.equal(tagName);
    });

    it('should return null if the tag doest not exist', async function() {
      // given
      const notExistingTagName = 'notExistingTagName';

      // when
      const result = await tagRepository.findByName({ name: notExistingTagName });

      // then
      expect(result).to.be.null;
    });
  });

});
