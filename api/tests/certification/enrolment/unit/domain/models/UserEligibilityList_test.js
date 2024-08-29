import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserEligibilityList and UserEligibilities classes', function () {
  describe('UserEligibilityList', function () {
    context('#get coreEligibilityV2', function () {
      it('should return core eligibility v2 if any', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false })],
          eligibilitiesV2: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true })],
        });

        // when
        const coreEligibilityV2 = userEligibilityList.coreEligibilityV2;

        // then
        expect(coreEligibilityV2.toDTO()).to.deep.equal({
          certification: LABEL_FOR_CORE,
          isCertifiable: true,
        });
      });
      it('should return null if none', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false })],
          eligibilitiesV2: [],
        });

        // when
        const coreEligibilityV2 = userEligibilityList.coreEligibilityV2;

        // then
        expect(coreEligibilityV2).to.be.null;
      });
    });
    context('#toDTO', function () {
      it('should return model as DTO', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          userId: 123,
          date: someDate,
          eligibilities: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true })],
          eligibilitiesV2: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true })],
        });

        // when
        const DTO = userEligibilityList.toDTO();

        // then
        expect(DTO).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
        });
      });
    });
  });

  describe('UserCoreEligibility', function () {
    context('#get isCore', function () {
      it('should return true', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility();

        // when
        const isCore = coreEligibility.isCore;

        // then
        expect(isCore).to.be.true;
      });
    });
    context('#get isCertifiable', function () {
      it('should return true when is certifiable', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true });

        // when
        const isCertifiable = coreEligibility.isCertifiable;

        // then
        expect(isCertifiable).to.be.true;
      });
      it('should return false when is not certifiable', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({
          isCertifiable: false,
        });

        // when
        const isCertifiable = coreEligibility.isCertifiable;

        // then
        expect(isCertifiable).to.be.false;
      });
    });
    context('#toDTO', function () {
      it('should return model as DTO', function () {
        // given
        const coreUserEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({
          isCertifiable: true,
        });

        // when
        const DTO = coreUserEligibility.toDTO();

        // then
        expect(DTO).to.deep.equal({ certification: LABEL_FOR_CORE, isCertifiable: true });
      });
    });
  });
});
