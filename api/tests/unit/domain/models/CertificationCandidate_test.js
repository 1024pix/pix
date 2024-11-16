import { CertificationCandidate } from '../../../../src/shared/domain/models/index.js';
import { getI18n } from '../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect } from '../../../test-helper.js';

const i18n = getI18n();
const translate = i18n.__;

describe('Unit | Domain | Models | Certification Candidate', function () {
  let rawData, expectedData, coreSubscription, complementarySubscription;

  beforeEach(function () {
    coreSubscription = domainBuilder.buildCoreSubscription();
    complementarySubscription = domainBuilder.buildComplementarySubscription();
    const date = new Date();

    rawData = {
      firstName: 'Jean-Pierre',
      lastName: 'Foucault',
      birthCity: 'Marseille',
      birthProvinceCode: '13',
      birthCountry: 'France',
      externalId: 'QVGDM',
      email: 'jp@fou.com',
      birthdate: '1940-05-05',
      extraTimePercentage: 0.3,
      sessionId: 1,
      userId: 2,
      sex: 'M',
      subscriptions: [coreSubscription],
      billingMode: 'FREE',
      reconciledAt: date,
    };

    expectedData = {
      ...rawData,
      id: undefined,
      authorizedToStart: false,
      billingMode: 'FREE',
      birthINSEECode: undefined,
      birthPostalCode: undefined,
      createdAt: undefined,
      organizationLearnerId: null,
      prepaymentCode: null,
      resultRecipientEmail: undefined,
      complementaryCertification: null,
      subscriptions: [coreSubscription],
      hasSeenCertificationInstructions: false,
      accessibilityAdjustmentNeeded: false,
      reconciledAt: date,
    };
  });

  describe('constructor', function () {
    describe('when there is no complementary certification', function () {
      it('should build a Certification Candidate', function () {
        const certificationCandidate = new CertificationCandidate(rawData);

        expect(certificationCandidate).to.deep.equal(expectedData);
      });
    });

    describe('when there is a complementary certification', function () {
      it('should build a Certification Candidate', function () {
        // given
        rawData = {
          ...rawData,
          complementaryCertification: { id: 99 },
        };

        expectedData = {
          ...expectedData,
          complementaryCertification: { id: 99 },
          subscriptions: [coreSubscription],
        };

        // when
        const certificationCandidate = new CertificationCandidate(rawData);

        // then
        expect(certificationCandidate).to.deep.equal(expectedData);
      });
    });
  });

  describe('isAuthorizedToStart', function () {
    it('should return false when authorizedToStart is false', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        ...rawData,
        authorizedToStart: false,
      });

      // then
      expect(certificationCandidate.isAuthorizedToStart()).to.be.false;
    });

    it('should return true when authorizedToStart is true', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ ...rawData, authorizedToStart: true });

      // then
      expect(certificationCandidate.isAuthorizedToStart()).to.be.true;
    });
  });

  describe('parseBillingMode', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { value: 'Gratuite', expectedTranslation: 'FREE' },
      { value: 'Payante', expectedTranslation: 'PAID' },
      { value: 'Prépayée', expectedTranslation: 'PREPAID' },
    ].forEach(({ value, expectedTranslation }) => {
      it(`should return ${expectedTranslation} when ${value} is translated`, function () {
        expect(CertificationCandidate.parseBillingMode({ billingMode: value, translate })).to.equal(
          expectedTranslation,
        );
      });
    });
  });

  describe('translateBillingMode', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { value: 'FREE', expectedTranslation: 'Gratuite' },
      { value: 'PAID', expectedTranslation: 'Payante' },
      { value: 'PREPAID', expectedTranslation: 'Prépayée' },
    ].forEach(({ value, expectedTranslation }) => {
      it(`should return ${expectedTranslation} when ${value} is translated`, function () {
        expect(CertificationCandidate.translateBillingMode({ billingMode: value, translate })).to.equal(
          expectedTranslation,
        );
      });
    });
  });

  describe('#isGranted', function () {
    it('should return true when certification candidate has acquired complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        ...rawData,
        complementaryCertification: domainBuilder.buildComplementaryCertification({ key: 'PIX+' }),
      });

      // when/then
      expect(certificationCandidate.isGranted('PIX+')).to.be.true;
    });

    it('should return false when certification candidate has not acquired complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        ...rawData,
        complementaryCertification: domainBuilder.buildComplementaryCertification({ key: 'toto' }),
      });

      // when/then
      expect(certificationCandidate.isGranted('PIX+')).to.be.false;
    });
  });

  describe('#isEnrolledToComplementaryOnly', function () {
    it('should return false when certification candidate has only a core subscription', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        subscriptions: [coreSubscription],
      });

      // when/then
      expect(certificationCandidate.isEnrolledToComplementaryOnly()).to.be.false;
    });

    it('should return false when certification candidate has multiple subscriptions', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        subscriptions: [coreSubscription, complementarySubscription],
      });

      // when/then
      expect(certificationCandidate.isEnrolledToComplementaryOnly()).to.be.false;
    });

    it('should return false when certification candidate has only a complementary', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        subscriptions: [complementarySubscription],
      });

      // when/then
      expect(certificationCandidate.isEnrolledToComplementaryOnly()).to.be.true;
    });
  });
});
