const { expect, knex } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', () => {
    before(() => knex('assessment-results').delete());

    afterEach(() => knex('assessment-results').delete());

    it('should persist the mark in db', () => {
      // given
      const result = new AssessmentResult({
        pixScore: 13,
        level: 1,
        emitter: 'SonGoku',
        comment: 'Parce que'
      });

      // when
      const promise = AssessmentResultRepository.save(result);

      // then
      return promise.then(() => knex('assessment-results').select())
        .then((result) => {
          expect(result).to.have.lengthOf(1);
        });
    });

    it('should return the saved mark', () => {
      // given
      const result = new AssessmentResult({
        pixScore: 13,
        level: 1,
        emitter: 'SonGoku',
        comment: 'Parce que'
      });

      // when
      const promise = AssessmentResultRepository.save(result);

      // then
      return promise.then(result => {
        expect(result).to.be.an.instanceOf(AssessmentResult);

        expect(result).to.have.property('id').and.not.to.be.null;
      });
    });
  });
});

