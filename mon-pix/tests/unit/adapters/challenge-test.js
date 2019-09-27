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
      const query = { assessmentId: 1 };
      const url = await adapter.urlForQueryRecord(query, 'challenge');

      // then
      expect(query.assessmentId).to.be.undefined;
      expect(url.endsWith('/assessments/1/next')).to.be.true;
    });

  });

});
