import { CompetenceMark } from '../../../../../../src/certification/shared/domain/models/CompetenceMark.js';
import * as competenceMarkRepository from '../../../../../../src/certification/shared/infrastructure/repositories/competence-mark-repository.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | CompetenceMark', function () {
  describe('#save', function () {
    let assessmentResultId;
    let competenceMark;

    beforeEach(async function () {
      assessmentResultId = await databaseBuilder.factory.buildAssessmentResult().id;
      await databaseBuilder.commit();

      competenceMark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
        assessmentResultId,
      });
    });

    it('should persist the mark in db', async function () {
      // when
      await competenceMarkRepository.save(competenceMark);

      // then
      const marks = await knex('competence-marks').select();
      expect(marks).to.have.lengthOf(1);
    });

    it('should return the saved mark', async function () {
      // given
      const mark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
        assessmentResultId,
      });

      // when
      const savedMark = await competenceMarkRepository.save(mark);

      // then
      expect(savedMark).to.be.an.instanceOf(CompetenceMark);
      expect(savedMark).to.have.property('id').and.not.to.be.null;
    });
  });
});
