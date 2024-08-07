import { Subscription } from '../../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Subscription', function () {
  let certificationCandidate;
  let complementaryCertification;

  beforeEach(function () {
    certificationCandidate = domainBuilder.buildCertificationCandidate();
    complementaryCertification = domainBuilder.buildComplementaryCertification();
  });

  describe('When the subscription is core', function () {
    it('should return a core Subscription instance', function () {
      // given
      const expectedSubscription = new Subscription({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationId: null,
        type: SUBSCRIPTION_TYPES.CORE,
      });

      // when
      const subscription = Subscription.buildCore({
        certificationCandidateId: certificationCandidate.id,
      });

      // then
      expect(subscription).to.deepEqualInstance(expectedSubscription);
    });

    it('should not allow to have a complementaryCertificationId', function () {
      // given, when
      const error = catchErrSync((data) => new Subscription(data))({
        complementaryCertificationId: complementaryCertification.id,
        type: SUBSCRIPTION_TYPES.CORE,
      });

      // then
      expect(error).to.be.an.instanceOf(TypeError);
    });
  });

  describe('When the subscription is complementary', function () {
    it('should return a complementary Subscription instance', function () {
      // given / when
      const subscription = Subscription.buildComplementary({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationId: complementaryCertification.id,
      });

      const expectedSubscription = new Subscription({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationId: complementaryCertification.id,
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      });

      // then
      expect(subscription).to.deepEqualInstance(expectedSubscription);
    });

    it('should enforce the need of the complementaryCertificationId', function () {
      // given /  when
      const error = catchErrSync((data) => new Subscription(data))({
        complementaryCertificationId: null,
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      });

      // then
      expect(error).to.be.an.instanceOf(TypeError);
    });
  });

  describe('#isComplementary', function () {
    it('should return true when subscription type is COMPLEMENTARY', function () {
      // given
      const subscription = domainBuilder.certification.enrolment.buildSubscription({
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
        complementaryCertificationId: 123,
      });

      // when
      const isComplementary = subscription.isComplementary();

      // then
      expect(isComplementary).to.be.true;
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    Object.keys(SUBSCRIPTION_TYPES)
      .filter((typeKey) => typeKey !== SUBSCRIPTION_TYPES.COMPLEMENTARY)
      .forEach((typeKey) => {
        it(`should return false when type is ${SUBSCRIPTION_TYPES[typeKey]}`, function () {
          // given
          const subscription = domainBuilder.certification.enrolment.buildSubscription({
            type: SUBSCRIPTION_TYPES[typeKey],
            complementaryCertificationId: null,
          });

          // when
          const isComplementary = subscription.isComplementary();

          // then
          expect(isComplementary).to.be.false;
        });
      });
  });
});
