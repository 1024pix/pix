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
});

