import * as certificationCenterApi from '../../../../../src/team/application/api/certification-center.api.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Team | Unit | Application | API | Certification center', function () {
  describe('#archiveCertificationCenterData', function () {
    it('calls archiveOrganizationCenterData usecase', async function () {
      // given
      const date = new Date(2024, 12, 19);
      const userId = 1;
      sinon.stub(usecases, 'archiveCertificationCenterData').resolves();

      // when
      await certificationCenterApi.archiveCertificationCenterData({
        certificationCenterId: 'foo',
        archiveDate: date,
        archivedBy: userId,
      });

      // then
      expect(usecases.archiveCertificationCenterData).to.have.been.calledOnceWith({
        certificationCenterId: 'foo',
        archiveDate: date,
        archivedBy: userId,
      });
    });
  });
});
