import dayjs from 'dayjs';

import { usecases as libUsecases } from '../../../../../lib/domain/usecases/index.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { scoOrganizationLearnerController } from '../../../../../src/identity-access-management/application/sco-organization-learner/sco-organization-learner.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, hFake, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Application | Controller | Sco Organization Learner', function () {
  let httpTestServer;
  let routesUnderTest;
  let clock;
  const now = new Date('2024-03-02T15:00:00Z');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    routesUnderTest = identityAccessManagementRoutes[0];
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);

    sinon.stub(usecases, 'generateUsernames');
    sinon.stub(libUsecases, 'generateResetOrganizationLearnersPasswordCsvContent');
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#generateUsernamesFile', function () {
    it('returns a 200 HTTP status code with a response', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: { 'organization-id': '1', 'organization-learner-ids': ['11', '12'] },
          },
        },
      };
      usecases.generateUsernames.resolves([
        {
          firstName: 'Simone',
          lastName: 'Biles',
          division: '4F',
          username: 'simone.biles2024',
          password: 'Pix12345',
        },
        {
          username: 'rebeca.andrade2024',
          firstName: 'Rebeca',
          lastName: 'Andrade',
          division: '4F',
          password: '',
        },
      ]);
      libUsecases.generateResetOrganizationLearnersPasswordCsvContent.resolves(
        'division;lastName;firstName;username;password\n4F;Biles;Simone;simone.biles2024;Pix12345\n4F;Andrade;Rebeca;;rebeca.andrade2024;\n',
      );
      const expectedDate = dayjs(now).format('YYYYMMDD_HHmm');
      const expectedGeneratedCsvContentFileName = `${expectedDate}_organization_learner_usernames.csv`;

      // when
      const { headers, statusCode } = await scoOrganizationLearnerController.generateUsernamesFile(request, hFake);

      // then
      expect(statusCode).to.equal(200);
      expect(headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(headers['content-disposition']).to.contains(expectedGeneratedCsvContentFileName);
    });
  });
});
