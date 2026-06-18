import sinon from 'sinon';

import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import { scoOrganizationManagementRoute as moduleUnderTest } from '../../../../../src/prescription/learner-management/application/sco-organization-management-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Application | Route | sco-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(scoOrganizationManagementController, 'reconcileScoOrganizationLearnerManually')
      .callsFake((request, h) => h.response('ok').code(204));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/sco-organization-learners/association', function () {
    const method = 'POST';
    const url = '/api/sco-organization-learners/association';

    context('User association with firstName, lastName, birthdate and campaignCode', function () {
      it('should succeed', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should succeed when there is a space', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert ',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
      });

      it('should return an error when there is no payload', async function () {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid first name attribute in the payload', async function () {
        // given
        const INVALID_FIRSTNAME = ' ';
        const payload = {
          data: {
            attributes: {
              'first-name': INVALID_FIRSTNAME,
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid last name attribute in the payload', async function () {
        // given
        const INVALID_LASTNAME = '';
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': INVALID_LASTNAME,
              birthdate: '2012-12-12',
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012- 12-12';

        // when
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012-012-12';
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '1999-99-99';
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'organization-id': 1,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid organizationId attribute in the payload', async function () {
        // given
        const INVALID_ORGANIZAION_ID = '';
        const payload = {
          data: {
            attributes: {
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'organization-id': INVALID_ORGANIZAION_ID,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
