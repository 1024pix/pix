const { expect, knex, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const Tag = require('../../../../lib/domain/models/Tag');
const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');
const tagRepository = require('../../../../lib/infrastructure/repositories/tag-repository');

describe('Integration | Repository | TagRepository', () => {

  describe('#create', () => {

    afterEach(async () => {
      await knex('tags').delete();
    });

    it('should create a Tag', async () => {
      // given
      const tag = domainBuilder.buildTag({ name: 'A Tag' });

      // when
      const createdTag = await tagRepository.create(tag);

      // then
      expect(createdTag).to.be.instanceOf(Tag);
      expect(createdTag.name).to.equal(tag.name);
    });

    context('when a tag name already exist', () => {

      it('should throw an AlreadyExistingEntityError', async () => {
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

  describe('#findByName', () => {

    it('should return the tag if it exists', async () => {
      // given
      const tagName = 'A Tag';
      databaseBuilder.factory.buildTag({ name: tagName });
      await databaseBuilder.commit();

      // when
      const result = await tagRepository.findByName({ name: tagName });

      // then
      expect(result.name).to.equal(tagName);
    });

    it('should return null if the tag doest not exist', async () => {
      // given
      const notExistingTagName = 'notExistingTagName';

      // when
      const result = await tagRepository.findByName({ name: notExistingTagName });

      // then
      expect(result).to.be.null;
    });
  });

});
