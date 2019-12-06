const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const CompetenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

describe('Integration | Repository | CompetenceMark', () => {

  describe('#save', () => {
    let competenceMark;
    beforeEach(async () => {
      // given
      competenceMark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });
    });

    afterEach(async () => {
      await knex('competence-marks').delete();
    });

    it('should persist the mark in db', () => {
      // when
      const promise = CompetenceMarkRepository.save(competenceMark);

      // then
      return promise.then(() => knex('competence-marks').select())
        .then((marks) => {
          expect(marks).to.have.lengthOf(1);
        });
    });

    it('should return the saved mark', () => {
      // given
      const mark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });

      // when
      const promise = CompetenceMarkRepository.save(mark);

      // then
      return promise.then((mark) => {
        expect(mark).to.be.an.instanceOf(CompetenceMark);

        expect(mark).to.have.property('id').and.not.to.be.null;
      });
    });

    context('when competenceMark is not validated', () => {
      it('should return an error', () => {
        // given
        const expectedValidationErrorMessage = 'ValidationError: "level" must be less than or equal to 8';
        const markWithLevelGreaterThanEight = domainBuilder.buildCompetenceMark({
          score: 13,
          level: 10,
        });

        // when
        const promise = CompetenceMarkRepository.save(markWithLevelGreaterThanEight);

        // then
        return promise.catch((error) => {
          expect(error.message).to.be.equal(expectedValidationErrorMessage);
        });
      });

      it('should not saved the competenceMark', () => {
        // given
        const markWithLevelGreaterThanEight = domainBuilder.buildCompetenceMark({
          score: 13,
          level: 10,
        });

        // when
        const promise = CompetenceMarkRepository.save(markWithLevelGreaterThanEight);

        // then
        return promise.catch(() => knex('competence-marks').select())
          .then((marks) => {
            expect(marks).to.have.lengthOf(0);
          });
      });
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
      const promise = CompetenceMarkRepository.findByAssessmentResultId(assessmentResultId);

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
