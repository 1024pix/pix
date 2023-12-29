import { expect, sinon, knex } from '../../../test-helper.js';
import * as passageRepository from '../../../../src/devcomp/infrastructure/repositories/passage-repository.js';
import { Passage } from '../../../../src/devcomp/domain/models/Passage.js';

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
});
