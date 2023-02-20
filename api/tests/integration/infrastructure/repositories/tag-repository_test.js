import { expect, knex, domainBuilder, databaseBuilder, catchErr } from '../../../test-helper';
import { AlreadyExistingEntityError, NotFoundError } from '../../../../lib/domain/errors';
import Tag from '../../../../lib/domain/models/Tag';
import tagRepository from '../../../../lib/infrastructure/repositories/tag-repository';

describe('Integration | Repository | TagRepository', function () {
  afterEach(async function () {
    await knex('tags').delete();
  });

  describe('#create', function () {
    it('should create a Tag', async function () {
      // given
      const tag = domainBuilder.buildTag({ name: 'A Tag' });

      // when
      const createdTag = await tagRepository.create(tag);

      // then
      expect(createdTag).to.be.instanceOf(Tag);
      expect(createdTag.name).to.equal(tag.name);
    });

    context('when a tag name already exist', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
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

  describe('#findByName', function () {
    it('should return the tag if it exists', async function () {
      // given
      const tagName = 'A Tag';
      databaseBuilder.factory.buildTag({ name: tagName });
      await databaseBuilder.commit();

      // when
      const result = await tagRepository.findByName({ name: tagName });

      // then
      expect(result.name).to.equal(tagName);
    });

    it('should return null if the tag doest not exist', async function () {
      // given
      const notExistingTagName = 'notExistingTagName';

      // when
      const result = await tagRepository.findByName({ name: notExistingTagName });

      // then
      expect(result).to.be.null;
    });
  });

  describe('#findAll', function () {
    it('should return all the tags', async function () {
      // given
      const tag1 = new Tag({ id: 100000, name: 'PUBLIC' });
      const tag2 = new Tag({ id: 100001, name: 'PRIVE' });

      databaseBuilder.factory.buildTag(tag1);
      databaseBuilder.factory.buildTag(tag2);
      await databaseBuilder.commit();

      const expectedResult = [tag1, tag2];

      // when
      const result = await tagRepository.findAll();

      // then
      expect(result).to.be.deep.equal(expectedResult);
    });
  });

  describe('#get', function () {
    it('should return a tag by provided id', async function () {
      // given
      const insertedTag = databaseBuilder.factory.buildTag({ id: 1, name: 'AEFE' });
      await databaseBuilder.commit();

      // when
      const foundTag = await tagRepository.get(insertedTag.id);

      // then
      expect(foundTag).to.deep.equal({ id: 1, name: 'AEFE' });
    });

    it('should throw NotFoundError when tag id is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const error = await catchErr(tagRepository.get)(nonExistentId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
