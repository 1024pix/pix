const { sinon, expect } = require('../../../test-helper');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Controller | snapshot-controller', () => {

  describe('#find ', () => {
    let query, request, result, options, serialized;

    beforeEach(() => {
      query = {
        'filter[organizationId]': 1,
      };
      request = { query };
      options = { organizationId: 1 };
      result = {
        models: [{ id: 1 }, { id: 2 }],
        pagination: {},
      };
      serialized = {
        snapshots: [{ id: 1 }, { id: 2 }],
        meta: {},
      };

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findSnapshots');
      sinon.stub(snapshotSerializer, 'serialize');
    });

    it('should return the snapshots with pagination', async () => {
      // given
      queryParamsUtils.extractParameters.withArgs(query).returns(options);
      usecases.findSnapshots.withArgs({ options }).resolves(result);
      snapshotSerializer.serialize.withArgs(result.models, result.pagination).returns(serialized);

      // when
      const response = await snapshotController.find(request);

      // then
      expect(response).to.deep.equal(serialized);
    });

  });
});
