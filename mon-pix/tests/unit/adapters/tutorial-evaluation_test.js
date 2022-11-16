import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | tutorial-evaluation', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:tutorial-evaluation');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForCreateRecord', function () {
    it('should redirect to /api/users/tutorials/${tutorialId}/evaluate', async function () {
      // given
      const tutorialId = 'tutorialId';
      const snapshot = { adapterOptions: { tutorialId } };

      // when
      const url = await adapter.urlForCreateRecord('tutorial-evaluations', snapshot);

      // then
      expect(url.endsWith(`/users/tutorials/${tutorialId}/evaluate`)).to.be.true;
    });
  });

  describe('#urlForUpdateRecord', function () {
    it('should redirect to /api/users/tutorials/${tutorialId}/evaluate', async function () {
      // given
      const tutorialId = 'tutorialId';
      const snapshot = { adapterOptions: { tutorialId } };

      // when
      const url = await adapter.urlForUpdateRecord('tutorial-evaluations', snapshot);

      // then
      expect(url.endsWith(`/users/tutorials/${tutorialId}/evaluate`)).to.be.true;
    });
  });

  describe('#createRecord', function () {
    it('should call API to create a tutorial-evaluation', async function () {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId, status: 'LIKED' } };

      // when
      await adapter.createRecord(null, { modelName: 'tutorial-evaluation' }, tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/users/tutorials/${tutorialId}/evaluate`, 'PUT', {
        data: {
          data: {
            attributes: {
              status: 'LIKED',
            },
          },
        },
      });
    });
  });

  describe('#updateRecord', function () {
    it('should call API to create a tutorial-evaluation', async function () {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = {
        id: 12,
        adapterOptions: { tutorialId, status: 'LIKED' },
        serialize: function () {},
      };

      // when
      await adapter.updateRecord({}, { modelName: 'tutorial-evaluation' }, tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/users/tutorials/${tutorialId}/evaluate`, 'PUT', {
        data: {
          data: {
            attributes: {
              status: 'LIKED',
            },
          },
        },
      });
    });
  });
});
