import * as competenceScoreRepository from '../../../../../src/shared/infrastructure/repositories/competence-score-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Repository | competenceScoreRepository', function () {
  describe('#save and #findByUserId', function () {
    it('freezes the pix of a competence and updates it without duplicating the row', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await competenceScoreRepository.save({ userId, competenceId: 'recComp1', pix: 7.27 });
      await competenceScoreRepository.save({ userId, competenceId: 'recComp2', pix: 12 });
      await competenceScoreRepository.save({ userId, competenceId: 'recComp1', pix: 9.5 });

      // then
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });
      expect(pixByCompetence.get('recComp1')).to.be.closeTo(9.5, 0.001);
      expect(pixByCompetence.get('recComp2')).to.equal(12);
      expect(pixByCompetence.size).to.equal(2);
    });

    it('returns an empty balance for a user without any frozen score', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });

      // then
      expect(pixByCompetence.size).to.equal(0);
    });
  });

  describe('#forgetCompetence', function () {
    it('erases the balance of the competence, and only this one', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      await competenceScoreRepository.save({ userId, competenceId: 'recComp1', pix: 8 });
      await competenceScoreRepository.save({ userId, competenceId: 'recComp2', pix: 16 });

      // when
      await competenceScoreRepository.forgetCompetence({ userId, competenceId: 'recComp1' });

      // then
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });
      expect(pixByCompetence.has('recComp1')).to.be.false;
      expect(pixByCompetence.get('recComp2')).to.equal(16);
    });
  });
});
