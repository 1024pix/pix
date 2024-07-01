import { schoolController } from '../../../../src/school/application/school-controller.js';
import { Division } from '../../../../src/school/domain/models/Division.js';
import { OrganizationLearner } from '../../../../src/school/domain/models/OrganizationLearner.js';
import { School } from '../../../../src/school/domain/models/School.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

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
          query: { code },
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
                  displayName: 'Bob',
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

  describe('#getDivision', function () {
    context('if organization has divisions', function () {
      it('should return the serialized divisions', async function () {
        // given
        const organizationId = 1;

        sinon.stub(usecases, 'getDivisions');
        usecases.getDivisions.resolves([
          new Division({
            name: 'CM1-A',
          }),
          new Division({
            name: 'CM1-B',
          }),
          new Division({
            name: 'CM1-C',
          }),
          new Division({
            name: 'CM1-Z',
          }),
        ]);
        // when

        const request = {
          params: { organizationId },
        };
        const response = await schoolController.getDivisions(request, hFake);
        // Then
        const serializedDivisions = {
          data: [
            {
              id: 'CM1-A',
              attributes: {
                name: 'CM1-A',
              },
              type: 'divisions',
            },
            {
              id: 'CM1-B',
              attributes: {
                name: 'CM1-B',
              },
              type: 'divisions',
            },
            {
              id: 'CM1-C',
              attributes: {
                name: 'CM1-C',
              },
              type: 'divisions',
            },
            {
              id: 'CM1-Z',
              attributes: {
                name: 'CM1-Z',
              },
              type: 'divisions',
            },
          ],
        };

        expect(usecases.getDivisions).to.have.been.calledWith({ organizationId });
        expect(response).to.deep.equal(serializedDivisions);
      });
    });
  });
});
