const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

describe('Integration | Repository | CompetenceMark', () => {

  describe('#save', () => {
    let assessmentResultId;
    let competenceMark;
    beforeEach(async () => {
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

    afterEach(async () => {
      await knex('competence-marks').delete();
      await knex('assessment-results').delete();
    });

    it('should persist the mark in db', async () => {
      // when
      await competenceMarkRepository.save(competenceMark);

      // then
      const marks = await knex('competence-marks').select();
      expect(marks).to.have.lengthOf(1);

    });

    it('should return the saved mark', async () => {
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

  describe('#findByAssessmentResultId', () => {

    let assessmentResultId, competenceMarkIds;
    beforeEach(async () => {
      assessmentResultId = databaseBuilder.factory.buildAssessmentResult({}).id;
      const anotherAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({}).id;
      competenceMarkIds = _.map([
        { score: 13, level: 2, area_code: '4', competence_code: '4.2', assessmentResultId },
        { score: 10, level: 1, area_code: '3', competence_code: '3.1', assessmentResultId: anotherAssessmentResultId },
        { score: 24, level: 3, area_code: '3', competence_code: '3.1', assessmentResultId },
      ], (mark) => {
        return databaseBuilder.factory.buildCompetenceMark(mark).id;
      });

      await databaseBuilder.commit();
    });

    it('should return all competence-marks for one assessmentResult', () => {
      // when
      const promise = competenceMarkRepository.findByAssessmentResultId(assessmentResultId);

      // then
      return promise.then((competenceMarks) => {
        const sortedCompetenceMarks = _.sortBy(competenceMarks, [(mark) => { return mark.id; }]);
        expect(sortedCompetenceMarks[0].id).to.equal(competenceMarkIds[0]);
        expect(sortedCompetenceMarks[1].id).to.equal(competenceMarkIds[2]);
        expect(sortedCompetenceMarks.length).to.equal(2);
      });
    });
  });
});
