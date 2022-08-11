import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | sup-organization-learner', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:sup-organization-learner');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForCreateRecord', function () {
    it('should redirect to /sup-organization-learners/association', async function () {
      // when
      const url = await adapter.urlForCreateRecord('sup-organization-learner');

      // then
      expect(url.endsWith('/sup-organization-learners/association')).to.be.true;
    });
  });

  describe('#createRecord', function () {
    let expectedUrl, expectedMethod, expectedData, snapshot;

    beforeEach(function () {
      expectedUrl = 'http://localhost:3000/api/sup-organization-learners/association';
      expectedMethod = 'POST';
      expectedData = {
        data: {
          data: {
            attributes: {
              'campaign-code': 'AZERTY123',
              id: 'AZERTY123_last',
              'student-number': '123456789',
              'first-name': 'first',
              'last-name': 'last',
              birthdate: '10-10-2010',
            },
          },
        },
      };
      snapshot = {
        serialize: function () {
          return {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
                id: 'AZERTY123_last',
                'student-number': '123456789',
                'first-name': 'first',
                'last-name': 'last',
                birthdate: '10-10-2010',
              },
            },
          };
        },
      };
    });

    it('should serialize data', async function () {
      // when
      await adapter.createRecord(null, { modelName: 'sup-organization-learner' }, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
    });
  });
});
