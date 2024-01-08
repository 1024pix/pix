import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';
import * as passageRepository from '../../../../src/devcomp/infrastructure/repositories/passage-repository.js';
import { Passage } from '../../../../src/devcomp/domain/models/Passage.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';

describe('Integration | DevComp | Repositories | PassageRepository', function () {
  describe('#save', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2023-12-31'), 'Date');
    });

    afterEach(function () {
      clock.restore();
    });

    it('should save a passage', async function () {
      // given
      const passage = {
        moduleId: 'recModuleId',
      };

      // when
      const returnedPassage = await passageRepository.save(passage);

      // then
      expect(returnedPassage).to.be.instanceOf(Passage);
      expect(returnedPassage.moduleId).to.equal(passage.moduleId);
      expect(returnedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(returnedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));

      const savedPassage = await knex('passages').where({ id: returnedPassage.id }).first();
      expect(savedPassage.moduleId).to.equal(passage.moduleId);
      expect(savedPassage.createdAt).to.deep.equal(new Date('2023-12-31'));
      expect(savedPassage.updatedAt).to.deep.equal(new Date('2023-12-31'));
    });
  });

  describe('#get', function () {
    describe('when passage exists', function () {
      it('should return the found passage', async function () {
        // given
        const passage = databaseBuilder.factory.buildPassage({ id: 1, moduleId: 'my-module' });
        await databaseBuilder.commit();

        // when
        const result = await passageRepository.get({ passageId: 1 });

        // then
        expect(result).to.deepEqualInstance(
          new Passage({
            id: passage.id,
            moduleId: passage.moduleId,
            createdAt: passage.createdAt,
            updatedAt: passage.updatedAt,
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
