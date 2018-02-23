const { expect, knex } = require('../../../test-helper');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const CompetenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

describe('Integration | Repository | CompetenceMark', function() {

  describe('#save', () => {
    before(() => knex('marks').delete());

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
  });
});

