import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | certification-version', function (hooks) {
  setupTest(hooks);

  test('should call PATCH with certification version id and serialized data', async function (assert) {
    const adapter = this.owner.lookup('adapter:certification-version');
    const snapshot = {
      id: '456',
      changedAttributes: sinon.stub().resolves([]),
    };
    const serializedData = {
      data: {
        type: 'certification-versions',
        id: '456',
        attributes: {
          'challenges-configuration': {
            maximumAssessmentLength: 40,
          },
        },
      },
    };

    sinon.stub(adapter, 'serialize').returns(serializedData);
    sinon.stub(adapter, 'ajax').resolves({});

    await adapter.updateRecord(null, null, snapshot);

    const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-versions/456`;
    sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PATCH', { data: serializedData });
    assert.ok(adapter);
  });
});
