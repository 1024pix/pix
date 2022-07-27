import { describe, it } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user-tutorial', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:user-tutorial');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#createRecord', () => {
    it('should call API to create a user-tutorial', async function () {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { id: tutorialId };
      const snapshot = {
        belongsTo: sinon.stub(),
      };
      snapshot.belongsTo.withArgs('tutorial').returns(tutorial);

      // when
      await adapter.createRecord(null, 'user-tutorial', snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/tutorials/tutorialId', 'PUT');
    });
  });

  describe('#urlForDeleteRecord', () => {
    it('should return API to delete a user-tutorial', async function () {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { id: tutorialId };
      const snapshot = {
        belongsTo: sinon.stub(),
      };
      snapshot.belongsTo.withArgs('tutorial').returns(tutorial);

      // when
      const url = adapter.urlForDeleteRecord(null, 'user-tutorial', snapshot);

      // then
      expect(url).to.equal('http://localhost:3000/api/users/tutorials/tutorialId');
    });
  });
});
