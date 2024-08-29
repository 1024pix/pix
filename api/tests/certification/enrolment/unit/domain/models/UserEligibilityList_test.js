import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserEligibilityList and UserEligibilities classes', function () {
  describe('UserEligibilityList', function () {
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
