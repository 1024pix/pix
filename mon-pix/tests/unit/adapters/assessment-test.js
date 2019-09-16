import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | assessment', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:assessment');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForUpdateRecord', () => {
    it('should build update url from assessment id', async function() {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      expect(url.endsWith('/assessments/123')).to.be.true;
    });

    it('should redirect to complete-assessment', async function() {
      // when
      const options = { adapterOptions: { completeAssessment: true } };
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      expect(url.endsWith('/assessments/123/complete-assessment')).to.be.true;
    });

  });

});
