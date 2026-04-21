import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CertificationCompanionLiveAlert', function () {
  describe('#clear', function () {
    it('should clear a companion live alert', function () {
      // given
      const companionLiveAlert = domainBuilder.certification.shared.buildCertificationCompanionLiveAlert({
        status: CertificationCompanionLiveAlertStatus.ONGOING,
      });

      // when
      companionLiveAlert.clear();

      // then
      expect(companionLiveAlert.status).to.equal(CertificationCompanionLiveAlertStatus.CLEARED);
    });
  });
});
