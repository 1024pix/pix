const { expect, knex } = require('../../../test-helper');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const CompetenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const factory = require('../../../factory');

describe('Integration | Repository | CompetenceMark', function() {

  describe('#save', () => {
    before(() => knex('competence-marks').delete());

    afterEach(() => knex('competence-marks').delete());

    it('should persist the mark in db', () => {
      // given
      const mark = factory.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });

      // when
      const promise = CompetenceMarkRepository.save(mark);

      // then
      return promise.then(() => knex('competence-marks').select())
        .then((marks) => {
          expect(marks).to.have.lengthOf(1);
        });
    });

    it('should return the saved mark', () => {
      // given
      const mark = factory.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });

      // when
      const promise = CompetenceMarkRepository.save(mark);

      // then
      return promise.then(mark => {
        expect(mark).to.be.an.instanceOf(CompetenceMark);

        expect(mark).to.have.property('id').and.not.to.be.null;
      });

    });

    context('when competenceMark is not validated', () => {
      it('should return an error', () => {
        // given
        const markWithLevelGreaterThanEight = factory.buildCompetenceMark({
          score: 13,
          level: 10,
        });

        // when
        const promise = CompetenceMarkRepository.save(markWithLevelGreaterThanEight);

        // then
        return promise.catch((error) => {
          expect(error.message).to.be.equal('ValidationError: child "level" fails because ["level" must be less than or equal to 8]');
        });
      });

      it('should not saved the competenceMark', () => {
        // given
        const markWithLevelGreaterThanEight = factory.buildCompetenceMark({
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
    const assessmentResultId = 1;

    const competenceMark1 = {
      id: 1,
      score: 13,
      level: 2,
      area_code: '4',
      competence_code: '4.2',
      assessmentResultId,
    };

    const competenceMark2 = {
      id: 2,
      score: 24,
      level: 3,
      area_code: '3',
      competence_code: '3.1',
      assessmentResultId,
    };

    const competenceMark3 = {
      id: 3,
      score: 10,
      level: 1,
      area_code: '3',
      competence_code: '3.1',
      assessmentResultId: 2,
    };

    before(() => knex('competence-marks').insert([competenceMark1, competenceMark2, competenceMark3]));

    afterEach(() => knex('competence-marks').delete());

    it('should return all competence-marks for one assessmentResult', () => {
      // when
      const promise = CompetenceMarkRepository.findByAssessmentResultId(assessmentResultId);

      // then
      return promise.then((competenceMarks) => {
        expect(competenceMarks[0].id).to.equal(competenceMark1.id);
        expect(competenceMarks[1].id).to.equal(competenceMark2.id);
        expect(competenceMarks.length).to.equal(2);
      });
    });
  });
});

