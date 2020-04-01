import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | certification-candidate', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:certification-candidate');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForCreateRecord', () => {
    it('should build create url from certification-candidate id', async function() {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      expect(url.endsWith('/certification-candidates')).to.be.true;
    });

    it('should redirect to session/id/certification-candidate/participation', async function() {
      // when
      const options = { adapterOptions: { joinSession: true, sessionId: 456 } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      expect(url.endsWith('/sessions/456/candidate-participation')).to.be.true;
    });

  });

});
