import { describe, it } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user-tutorial', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:user-tutorial');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#createRecord', () => {
    it('should call API to create a user-tutorial', async function() {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId } };

      // when
      await adapter.createRecord(null, 'user-tutorial', tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me/tutorials/tutorialId', 'PUT');
    });
  });

  describe('#urlForFindAll', () => {
    it('should return API to find related tutorials', async function() {
      // when
      const url = adapter.urlForFindAll('user-lutorial');

      // then
      expect(url).to.equal('http://localhost:3000/api/users/me/tutorials');
    });
  });

  describe('#urlForDeleteRecord', () => {
    it('should return API to delete a user-tutorial', async function() {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId } };

      // when
      const url = adapter.urlForDeleteRecord(null, 'user-tutorial', tutorial);

      // then
      expect(url).to.equal('http://localhost:3000/api/users/me/tutorials/tutorialId');
    });
  });

});
