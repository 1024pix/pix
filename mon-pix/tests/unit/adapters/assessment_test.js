import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | assessment', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:assessment');
  });

  describe('#urlForUpdateRecord', () => {
    it('should build update url from assessment id', async function () {
      // given
      const options = { adapterOptions: {} };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      expect(url.endsWith('/assessments/123')).to.be.true;
    });

    it('should redirect to complete-assessment', async function () {
      // given
      const options = { adapterOptions: { completeAssessment: true } };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      expect(url.endsWith('/assessments/123/complete-assessment')).to.be.true;
    });

    it('should redirect to update last-question-state', async function () {
      // given
      const attrStub = (name) => (name === 'lastQuestionState' ? 'timeout' : null);
      const snapshot = {
        adapterOptions: { updateLastQuestionState: true },
        attr: attrStub,
      };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', snapshot);

      // then
      expect(url.endsWith('/assessments/123/last-challenge-state/timeout')).to.be.true;
    });
  });
});
