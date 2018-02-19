const { expect, knex } = require('../../../test-helper');

const Mark = require('../../../../lib/domain/models/Mark');
const MarkRepository = require('../../../../lib/infrastructure/repositories/mark-repository');

describe('Integration | Repository | Mark', function() {

  describe('#save', () => {

    afterEach(() => knex('marks').delete());

    it('should persist the mark in db', () => {
      // given
      const mark = new Mark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2'
      });

      // when
      const promise = MarkRepository.save(mark);

      // then
      return promise.then(() => knex('marks').select())
        .then((marks) => {
          expect(marks).to.have.lengthOf(1);
        });
    });

    it('should return the saved mark', () => {
      // given
      const mark = new Mark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2'
      });

      // when
      const promise = MarkRepository.save(mark);

      // then
      return promise.then(mark => {
        expect(mark).to.be.an.instanceOf(Mark);

        expect(mark).to.have.property('id').and.not.to.be.null;
      });
    });
  });
});

