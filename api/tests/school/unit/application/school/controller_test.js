import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';
import { schoolController } from '../../../../../src/school/application/school/controller.js';
import { School } from '../../../../../src/school/domain/models/School.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';

describe('Unit | Controller | school-controller', function () {
  describe('#getSchool', function () {
    context('if school exists', function () {
      it('should return the serialized progression', async function () {
        // given
        const code = 'COOLCLASS';

        sinon.stub(usecases, 'getSchoolByCode');
        usecases.getSchoolByCode.resolves(
          new School({
            id: '1',
            code,
            name: 'Ecole des fans',
            organizationLearners: [
              new OrganizationLearner({
                id: 10,
                organizationId: 1,
                division: 'CM1/CM2',
                firstName: 'Bob',
                lastName: 'Dylan',
                completedMissionIds: [],
              }),
            ],
          }),
        );
        // when

        const request = {
          params: { code },
        };
        const response = await schoolController.getSchool(request, hFake);
        // Then
        const serializedSchool = {
          data: {
            id: '1',
            attributes: {
              code,
              name: 'Ecole des fans',
              'organization-learners': [
                {
                  division: 'CM1/CM2',
                  firstName: 'Bob',
                  id: 10,
                  lastName: 'Dylan',
                  organizationId: 1,
                  completedMissionIds: [],
                },
              ],
            },
            type: 'schools',
          },
        };

        expect(usecases.getSchoolByCode).to.have.been.calledWith({ code });
        expect(response).to.deep.equal(serializedSchool);
      });
    });
  });
});
