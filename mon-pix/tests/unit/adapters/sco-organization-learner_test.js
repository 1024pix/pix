import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | sco-organization-learner', function () {
  setupTest();

  let adapter;

  beforeEach(function () {
    adapter = this.owner.lookup('adapter:sco-organization-learner');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForCreateRecord', function () {
    context('when is for searchMatchingStudent', function () {
      it('should redirect to /sco-organization-learners/possibilities ', async function () {
        // when
        const snapshot = { adapterOptions: { searchForMatchingStudent: true } };
        const url = await adapter.urlForCreateRecord('sco-organization-learner', snapshot);

        // then
        expect(url.endsWith('/sco-organization-learners/possibilities')).to.be.true;
      });
    });
    context('when is for tryReconciliation', function () {
      it('should redirect to /sco-organization-learners/association/auto', async function () {
        // when
        const snapshot = { adapterOptions: { tryReconciliation: true } };
        const url = await adapter.urlForCreateRecord('sco-organization-learner', snapshot);

        // then
        expect(url.endsWith('/sco-organization-learners/association/auto')).to.be.true;
      });
    });

    it('should redirect to /sco-organization-learners/association', async function () {
      // when
      const url = await adapter.urlForCreateRecord('sco-organization-learner', {});

      // then
      expect(url.endsWith('/sco-organization-learners/association')).to.be.true;
    });
  });

  describe('#createRecord', function () {
    context('when is for searchMatchingStudent', function () {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      beforeEach(function () {
        expectedUrl = 'http://localhost:3000/api/sco-organization-learners/possibilities';
        expectedMethod = 'PUT';
        expectedData = {
          data: {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
              },
            },
          },
        };
        snapshot = {
          record: {},
          adapterOptions: {
            searchForMatchingStudent: true,
            campaignCode: 'AZERTY123',
            birthdate: '2020-06-15',
            firstName: 'James',
            lastName: 'Bond',
          },
          serialize: function () {
            return {
              data: {
                attributes: {
                  'campaign-code': 'AZERTY123',
                },
              },
            };
          },
        };
      });

      it('should change method to PUT', async function () {
        // when
        await adapter.createRecord(null, { modelName: 'sco-organization-learner' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });

    context('when tryReconciliation is true', function () {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      beforeEach(function () {
        expectedUrl = 'http://localhost:3000/api/sco-organization-learners/association/auto';
        expectedMethod = 'POST';
        expectedData = {
          data: {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
              },
            },
          },
        };
        snapshot = {
          record: {},
          adapterOptions: {
            tryReconciliation: true,
            campaignCode: 'AZERTY123',
            firstName: 'James',
            lastName: 'Bond',
          },
          serialize: function () {
            return {
              data: {
                attributes: {
                  'campaign-code': 'AZERTY123',
                  'first-name': 'James',
                  'last-name': 'Bond',
                },
              },
            };
          },
        };
      });

      it('should remove user details', async function () {
        // when
        await adapter.createRecord(null, { modelName: 'sco-organization-learner' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });
  });
});
