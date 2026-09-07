import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | certification-version', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-version');
    sinon.stub(adapter, 'ajax').resolves({});
  });

  module('#updateRecord', function () {
    module('when no special adapterOptions', function () {
      test('calls PATCH with serialized data on the base url', async function (assert) {
        const serializedData = {
          data: {
            type: 'certification-versions',
            id: '456',
            attributes: { 'challenges-configuration': { maximumAssessmentLength: 40 } },
          },
        };
        sinon.stub(adapter, 'serialize').returns(serializedData);
        const snapshot = { id: '456', adapterOptions: {}, changedAttributes: sinon.stub().returns({}) };

        await adapter.updateRecord(null, null, snapshot);

        const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-versions/456`;
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH', { data: serializedData });
        assert.ok(true);
      });
    });

    module('when only the comments attribute has changed', function () {
      test('calls PATCH on the /comments sub-route', async function (assert) {
        sinon.stub(adapter, 'serialize').returns({});
        const snapshot = {
          id: '456',
          adapterOptions: {},
          changedAttributes: sinon.stub().returns({ comments: ['old', 'new'] }),
        };

        await adapter.updateRecord(null, null, snapshot);

        const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-versions/456/comments`;
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH');
        assert.ok(true);
      });
    });

    module('when the activate adapterOption is set', function () {
      test('calls PATCH on the /activation sub-route with no payload', async function (assert) {
        const snapshot = { id: '456', adapterOptions: { activate: true } };

        await adapter.updateRecord(null, null, snapshot);

        const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-versions/456/activation`;
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH');
        assert.ok(true);
      });
    });

    module('when the saveScoring adapterOption is set', function () {
      test('calls PATCH on the /scoring sub-route with serialized data', async function (assert) {
        const serializedData = {
          data: {
            type: 'certification-versions',
            id: '456',
            attributes: { 'global-scoring-configuration': [] },
          },
        };
        sinon.stub(adapter, 'serialize').returns(serializedData);
        const snapshot = { id: '456', adapterOptions: { saveScoring: true } };

        await adapter.updateRecord(null, null, snapshot);

        const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-versions/456/scoring`;
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH', { data: serializedData });
        assert.ok(true);
      });
    });
  });
});
