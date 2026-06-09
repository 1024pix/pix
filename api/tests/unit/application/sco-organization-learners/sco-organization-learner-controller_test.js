import sinon from 'sinon';

import { scoOrganizationLearnerController } from '../../../../src/identity-access-management/application/organization-learner-account-recovery/organization-learner-account-recovery.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Controller | sco-organization-learner', function () {
  describe('#checkScoAccountRecovery', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'checkScoAccountRecovery');
      usecases.checkScoAccountRecovery.resolves();
    });

    it('should return student account information serialized', async function () {
      // given
      const studentInformation = {
        ineIna: '1234567890A',
        firstName: 'Bob',
        lastName: 'Camond',
        birthdate: '2001-12-08',
      };

      usecases.checkScoAccountRecovery.withArgs({ studentInformation }).resolves({
        firstName: studentInformation.firstName,
        lastName: studentInformation.lastName,
        username: 'bcamond',
        latestOrganizationName: 'foo',
      });

      // when
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(
        {
          payload: {
            data: {
              type: 'student-information',
              attributes: {
                'ine-ina': studentInformation.ineIna,
                'first-name': studentInformation.firstName,
                'last-name': studentInformation.lastName,
                birthdate: studentInformation.birthdate,
              },
            },
          },
        },
        hFake,
      );

      // then
      expect(response.source).to.deep.equal({
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'first-name': 'Bob',
            'last-name': 'Camond',
            'latest-organization-name': 'foo',
            username: 'bcamond',
          },
        },
      });
    });
  });
});
