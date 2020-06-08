const { expect } = require('../../../test-helper');
const PartnerCertification = require('../../../../lib/domain/models/PartnerCertification');
const CleaCertification = require('../../../../lib/domain/models/CleaCertification');

describe('Unit | Domain | Models | PartnerCertification', () => {

  describe('static #certificationStatus', () => {

    context('when certification partner is falsy', () => {

      it('should return statuses.NOT_PASSED', async () => {
        // when
        const certificationStatus = PartnerCertification.certificationStatus(null);

        // then
        expect(certificationStatus).to.equal(PartnerCertification.statuses.NOT_PASSED);
      });
    });

    context('when certification partner is reallll man', () => {

      it('should return statuses.ACQUIRED when certification partner is acquired', async () => {
        // given
        const Partnercertification = new CleaCertification();
        Partnercertification.acquired = true;

        // when
        const certificationStatus = PartnerCertification.certificationStatus(Partnercertification);

        // then
        expect(certificationStatus).to.equal(PartnerCertification.statuses.ACQUIRED);
      });

      it('should return statuses.REJECTED when certification partner is not acquired', async () => {
        // given
        const Partnercertification = new CleaCertification();
        Partnercertification.acquired = false;

        // when
        const certificationStatus = PartnerCertification.certificationStatus(Partnercertification);

        // then
        expect(certificationStatus).to.equal(PartnerCertification.statuses.REJECTED);
      });
    });
  });
});

