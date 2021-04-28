import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | schooling-registration-user-association', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:schooling-registration-user-association');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForCreateRecord', () => {

    context('when is for searchMatchingStudent', function() {
      it('should redirect to /schooling-registrations-user-associations/possibilities ', async function() {
        // when
        const snapshot = { adapterOptions: { searchForMatchingStudent: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        expect(url.endsWith('/schooling-registration-user-associations/possibilities')).to.be.true;
      });
    });
    context('when is for tryReconciliation', function() {
      it('should redirect to /schooling-registrations-user-associations/auto ', async function() {
        // when
        const snapshot = { adapterOptions: { tryReconciliation: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        expect(url.endsWith('/schooling-registration-user-associations/auto')).to.be.true;
      });
    });
    context('when is for reconcileSup', function() {
      it('should redirect to /schooling-registrations-user-associations/student ', async function() {
        // when
        const snapshot = { adapterOptions: { reconcileSup: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        expect(url.endsWith('/schooling-registration-user-associations/student')).to.be.true;
      });
    });
  });

  describe('#createRecord', () => {

    context('when is for searchMatchingStudent', () => {

      let expectedUrl, expectedMethod, expectedData, snapshot;

      beforeEach(() => {
        expectedUrl = 'http://localhost:3000/api/schooling-registration-user-associations/possibilities';
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
          serialize: function() {
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

      it('should change method to PUT', async () => {
        // when
        await adapter.createRecord(null, { modelName: 'schooling-registration-user-association' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });

    context('when tryReconciliation is true', () => {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      beforeEach(() => {
        expectedUrl = 'http://localhost:3000/api/schooling-registration-user-associations/auto';
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
          serialize: function() {
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

      it('should remove user details', async () => {
        // when
        await adapter.createRecord(null, { modelName: 'schooling-registration-user-association' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });
  });
});
