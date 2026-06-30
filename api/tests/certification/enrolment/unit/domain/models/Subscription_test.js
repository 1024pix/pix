import { Subscription } from '../../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Enrolment | Domain | Models | Subscription', function () {
  let certificationCandidate;
  let complementaryCertification;

  beforeEach(function () {
    certificationCandidate = domainBuilder.certification.enrolment.buildCandidate();
    complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification();
  });

  describe('When the subscription is core', function () {
    it('should return a core Subscription instance', function () {
      // given
      const expectedSubscription = new Subscription({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationKey: null,
        type: SUBSCRIPTION_TYPES.CORE,
      });

      // when
      const subscription = Subscription.buildCore({
        certificationCandidateId: certificationCandidate.id,
      });

      // then
      expect(subscription).to.deepEqualInstance(expectedSubscription);
    });

    it('should not allow to have a complementaryCertificationKey', function () {
      // given, when
      const error = catchErrSync((data) => new Subscription(data))({
        complementaryCertificationKey: complementaryCertification.key,
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
        complementaryCertificationKey: complementaryCertification.key,
      });

      const expectedSubscription = new Subscription({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationKey: complementaryCertification.key,
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      });

      // then
      expect(subscription).to.deepEqualInstance(expectedSubscription);
    });

    it('should enforce the need of the complementaryCertificationKey', function () {
      // given /  when
      const error = catchErrSync((data) => new Subscription(data))({
        complementaryCertificationKey: null,
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
        complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      });

      // when
      const isComplementary = subscription.isComplementary();

      // then
      expect(isComplementary).to.be.true;
    });

    Object.keys(SUBSCRIPTION_TYPES)
      .filter((typeKey) => typeKey !== SUBSCRIPTION_TYPES.COMPLEMENTARY)
      .forEach((typeKey) => {
        it(`should return false when type is ${SUBSCRIPTION_TYPES[typeKey]}`, function () {
          // given
          const subscription = domainBuilder.certification.enrolment.buildSubscription({
            type: SUBSCRIPTION_TYPES[typeKey],
            complementaryCertificationKey: null,
          });

          // when
          const isComplementary = subscription.isComplementary();

          // then
          expect(isComplementary).to.be.false;
        });
      });
  });

  describe('#isCore', function () {
    it('should return true when subscription type is CORE', function () {
      // given
      const subscription = domainBuilder.certification.enrolment.buildSubscription({
        type: SUBSCRIPTION_TYPES.CORE,
        complementaryCertificationKey: null,
      });

      // when
      const isCore = subscription.isCore();

      // then
      expect(isCore).to.be.true;
    });

    Object.keys(SUBSCRIPTION_TYPES)
      .filter((typeKey) => typeKey !== SUBSCRIPTION_TYPES.CORE)
      .forEach((typeKey) => {
        it(`should return false when type is ${SUBSCRIPTION_TYPES[typeKey]}`, function () {
          // given
          const subscription = domainBuilder.certification.enrolment.buildSubscription({
            type: SUBSCRIPTION_TYPES[typeKey],
            complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          });

          // when
          const isCore = subscription.isCore();

          // then
          expect(isCore).to.be.false;
        });
      });
  });
});
