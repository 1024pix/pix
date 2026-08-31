import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | combined-course-blueprint', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:combined-course-blueprint');
    sinon.stub(adapter, 'ajax').resolves({});
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#detachOrganizations', function () {
    test('should build correct url and method', async function (assert) {
      // given
      const combinedCourseBlueprintId = 1;
      const organizationId = 2;
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}/organizations/${organizationId}`;

      // when
      await adapter.detachOrganizations(combinedCourseBlueprintId, organizationId);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'DELETE');
      assert.ok(true);
    });
  });

  module('#attachOrganizations', function () {
    test('should build correct url, method and payload', async function (assert) {
      // given
      const combinedCourseBlueprintId = 1;
      const organizationIds = [123, 456];
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}/organizations`;
      const expectedPayload = { data: { 'organization-ids': organizationIds } };

      // when
      await adapter.attachOrganizations({ combinedCourseBlueprintId, organizationIds });

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
      assert.ok(true);
    });

    test('should return the ajax call result', async function (assert) {
      // given
      const attachedOrganizations = { data: { attributes: { 'attached-organization-ids': [123] } } };
      adapter.ajax.resolves(attachedOrganizations);

      // when
      const result = await adapter.attachOrganizations({
        combinedCourseBlueprintId: 1,
        organizationIds: [123],
      });

      // then
      assert.deepEqual(result, attachedOrganizations);
    });
  });

  module('#createRecord', function (createRecordHooks) {
    const type = { modelName: 'combined-course-blueprint' };
    const expectedUrl = `${ENV.APP.API_HOST}/api/admin/combined-course-blueprints`;

    let serializedRecord;

    createRecordHooks.beforeEach(function () {
      serializedRecord = {
        data: {
          type: 'combined-course-blueprints',
          attributes: { name: 'Nom', 'internal-name': 'Nom interne' },
        },
      };
      sinon.stub(adapter, 'serialize').returns(serializedRecord);
    });

    module('when the cappedTubeRequirements adapterOption is set', function () {
      test('should add the capped tube requirements in the payload', async function (assert) {
        // given
        const cappedTubeRequirements = [{ threshold: 50, tubes: [{ tubeId: '123', level: 1 }] }];
        const snapshot = { adapterOptions: { cappedTubeRequirements } };

        // when
        await adapter.createRecord(null, type, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', {
          data: {
            data: {
              type: 'combined-course-blueprints',
              attributes: {
                name: 'Nom',
                'internal-name': 'Nom interne',
                'capped-tube-requirements': cappedTubeRequirements,
              },
            },
          },
        });
        assert.ok(true);
      });
    });

    module('when the schemaThreshold adapterOption is set', function () {
      test('should add the schema threshold in the payload', async function (assert) {
        // given
        const schemaThreshold = 75;
        const snapshot = { adapterOptions: { schemaThreshold } };

        // when
        await adapter.createRecord(null, type, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', {
          data: {
            data: {
              type: 'combined-course-blueprints',
              attributes: {
                name: 'Nom',
                'internal-name': 'Nom interne',
                'schema-threshold': schemaThreshold,
              },
            },
          },
        });
        assert.ok(true);
      });
    });
  });
});
