import { expect } from 'chai';
import sinon from 'sinon';

import { combinedCourseBlueprintController } from '../../../../src/quest/application/combined-course-blueprint-controller.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Quest | Application | Controller | CombinedCourseBlueprint', function () {
  describe('#detachOrganizations', function () {
    it('should call detachOrganizationsFromCombinedCourseBlueprint usecase with combinedCourseBlueprintId and organizationIds', async function () {
      // given
      const combinedCourseBlueprintId = 'blueprintId123';
      const organizationToDetachId = 'organization-id123';
      const otherOrganizationToDetachId = 'otherOrganization-id123';
      const request = {
        params: { blueprintId: combinedCourseBlueprintId },
        payload: { 'organization-ids': [organizationToDetachId, otherOrganizationToDetachId] },
      };

      const usecaseStub = sinon.stub(usecases, 'detachOrganizationsFromCombinedCourseBlueprint').resolves();

      // when
      const response = await combinedCourseBlueprintController.detachOrganizations(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecaseStub).to.have.been.calledWith({
        combinedCourseBlueprintId,
        organizationIds: [organizationToDetachId, otherOrganizationToDetachId],
      });
    });
  });
});
