const { expect, knex } = require('../../../test-helper');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const CompetenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

describe('Integration | Repository | CompetenceMark', function() {

  describe('#save', () => {
    before(() => knex('competence-marks').delete());

    afterEach(() => knex('competence-marks').delete());

    it('should persist the mark in db', () => {
      // given
      const mark = new CompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2'
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
      const mark = new CompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2'
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
        const markWithLevelSupAtFive = new CompetenceMark({
          score: 13,
          level: 10,
          area_code: '4',
          competence_code: '4.2'
        });

        // when
        const promise = CompetenceMarkRepository.save(markWithLevelSupAtFive);

        // then
        return promise.catch((error) => {
          expect(error.message).to.be.equal('ValidationError: child "level" fails because ["level" must be less than or equal to 5]');
        });
      });

      it('should not saved the competenceMark', () => {
        // given
        const markWithLevelSupAtFive = new CompetenceMark({
          score: 13,
          level: 10,
          area_code: '4',
          competence_code: '4.2'
        });

        // when
        const promise = CompetenceMarkRepository.save(markWithLevelSupAtFive);

        // then
        return promise.catch(() => knex('competence-marks').select())
          .then((marks) => {
            expect(marks).to.have.lengthOf(0);
          });
      });
    });
  });
});

