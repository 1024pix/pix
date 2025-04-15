import { Passage } from '../../../../src/devcomp/domain/models/Passage.js';
import * as passageRepository from '../../../../src/devcomp/infrastructure/repositories/passage-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | DevComp | Repositories | PassageRepository', function () {
  describe('#save', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2023-12-31'), 'Date');
    });

    afterEach(function () {
      clock.restore();
    });

    it('should save a passage with a userId provided', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const passage = {
        moduleId: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        userId: userId,
      };

      // when
      const returnedPassage = await passageRepository.save(passage);

      // then
      expect(returnedPassage).to.be.instanceOf(Passage);
      expect(returnedPassage.moduleId).to.equal(passage.moduleId);
      expect(returnedPassage.userId).to.equal(passage.userId);
      expect(returnedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(returnedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));

      const savedPassage = await knex('passages').where({ id: returnedPassage.id }).first();
      expect(savedPassage.moduleId).to.equal(passage.moduleId);
      expect(savedPassage.userId).to.equal(passage.userId);
      expect(savedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(savedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));
    });

    it('should save a passage no userId provided', async function () {
      // given
      const passage = {
        moduleId: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        userId: null,
      };

      // when
      const returnedPassage = await passageRepository.save(passage);

      // then
      expect(returnedPassage).to.be.instanceOf(Passage);
      expect(returnedPassage.moduleId).to.equal(passage.moduleId);
      expect(returnedPassage.userId).to.equal(passage.userId);
      expect(returnedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(returnedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));

      const savedPassage = await knex('passages').where({ id: returnedPassage.id }).first();
      expect(savedPassage.moduleId).to.equal(passage.moduleId);
      expect(savedPassage.userId).to.equal(passage.userId);
      expect(savedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(savedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));
    });
  });

  describe('#update', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2024-01-02'), 'Date');
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update a passage', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage({
        id: 1,
        moduleId: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        userId: null,
        createdAt: new Date('2023-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const returnedPassage = await passageRepository.update({
        passage: { ...passage, terminatedAt: new Date('2024-01-02') },
      });

      // then
      expect(returnedPassage).to.be.instanceOf(Passage);
      expect(returnedPassage.moduleId).to.equal(passage.moduleId);
      expect(returnedPassage.userId).to.equal(passage.userId);
      expect(returnedPassage.createdAt).to.deep.equal(passage.createdAt);
      expect(returnedPassage.updatedAt).to.deep.equal(new Date('2024-01-02'));
      expect(returnedPassage.terminatedAt).to.deep.equal(new Date('2024-01-02'));

      const savedPassage = await knex('passages').where({ id: returnedPassage.id }).first();
      expect(savedPassage.moduleId).to.equal(passage.moduleId);
      expect(savedPassage.userId).to.equal(passage.userId);
      expect(savedPassage.createdAt).to.deep.equal(passage.createdAt);
      expect(savedPassage.updatedAt).to.deep.equal(new Date('2024-01-02'));
      expect(savedPassage.terminatedAt).to.deep.equal(new Date('2024-01-02'));
    });
  });

  describe('#get', function () {
    describe('when passage exists', function () {
      it('should return the found passage', async function () {
        // given
        const passage = databaseBuilder.factory.buildPassage({
          id: 1,
          moduleId: '25530e38-fdb9-497a-923e-9e2d1be47918',
          userId: null,
        });
        await databaseBuilder.commit();

        // when
        const result = await passageRepository.get({ passageId: 1 });

        // then
        expect(result).to.deepEqualInstance(
          new Passage({
            id: passage.id,
            moduleId: passage.moduleId,
            userId: passage.userId,
            createdAt: passage.createdAt,
            updatedAt: passage.updatedAt,
            terminatedAt: passage.terminatedAt,
          }),
        );
      });
    });

    describe('when passage does not exist', function () {
      it('should throw an error', async function () {
        // when
        const error = await catchErr(passageRepository.get)({ passageId: 1 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
