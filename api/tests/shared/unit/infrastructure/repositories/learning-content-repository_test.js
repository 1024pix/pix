import { findKey } from '../../../../../src/shared/infrastructure/repositories/learning-content-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | repositories | LearningContentRepository', function () {
  describe('FindKey', function () {
    describe('#cacheKey', function () {
      it('should return the same result as a basic template string', function () {
        // given
        const key = findKey`maSuperMéthode(${123}, ${456}, { foo: ${true} })`;

        // then
        expect(key).to.have.property('cacheKey', 'maSuperMéthode(123, 456, { foo: true })');
        expect(key.toString()).to.equal('maSuperMéthode(123, 456, { foo: true })');
      });
    });

    describe('#metricKey', function () {
      it('should return a string with values replaced by indexes', function () {
        // given
        const key = findKey`maSuperMéthode(${123}, ${456}, { foo: ${true} })`;

        // then
        expect(key).to.have.property('metricKey', 'maSuperMéthode(0, 1, { foo: 2 })');
      });
    });
  });
});
