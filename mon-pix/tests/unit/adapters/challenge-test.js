import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | challenge', function() {
  setupTest();

  describe('#urlForQueryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.owner.lookup('adapter:challenge');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build get next challenge url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ assessmentId: 1 }, 'challenge');

      // then
      expect(url.endsWith('/assessments/1/next')).to.be.true;
    });

    it('should build get next challenge url with query tryImproving if needed', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ assessmentId: 1, tryIfCanImprove: true }, 'challenge');

      // then
      expect(url.endsWith('/assessments/1/next?tryImproving=true')).to.be.true;
    });

  });

});
