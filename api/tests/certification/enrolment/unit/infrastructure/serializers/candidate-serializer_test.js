import { candidateSerializer } from '../../../../../../src/certification/enrolment/infrastructure/serializers/candidate-serializer.js';
import { BILLING_MODES, SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Serializer | candidate', function () {
  context('#serializeId', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const candidateId = 123;
      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidates',
        },
      };

      // when
      const result = candidateSerializer.serializeId(candidateId);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });

  context('#deserialize', function () {
    let candidateData;

    beforeEach(function () {
      candidateData = {
        id: null,
        createdAt: new Date('2020-01-01'),
        firstName: 'Jean-Charles',
        lastName: 'Quiberon',
        sex: 'M',
        birthPostalCode: 'Code postal',
        birthINSEECode: 'Insee code',
        birthCity: 'Ma ville',
        birthProvinceCode: 'Mon département',
        birthCountry: 'Mon pays',
        email: 'jc.quiberon@example.net',
        resultRecipientEmail: 'ma_maman@example.net',
        birthdate: '1990-05-06',
        extraTimePercentage: 0.3,
        externalId: 'JCQUIB',
        userId: 777,
        sessionId: 888,
        organizationLearnerId: 999,
        authorizedToStart: false,
        complementaryCertificationId: null,
        billingMode: BILLING_MODES.FREE,
        prepaymentCode: null,
        hasSeenCertificationInstructions: false,
        subscriptions: [],
      };
    });

    it('should deserialize correctly candidate with subscriptions', async function () {
      // given
      const candidateJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: null,
          attributes: {
            'first-name': candidateData.firstName,
            'last-name': candidateData.lastName,
            'created-at': candidateData.createdAt,
            sex: candidateData.sex,
            'birth-city': candidateData.birthCity,
            'birth-province-code': candidateData.birthProvinceCode,
            'birth-country': candidateData.birthCountry,
            'birth-insee-code': candidateData.birthINSEECode,
            'birth-postal-code': candidateData.birthPostalCode,
            email: candidateData.email,
            'result-recipient-email': candidateData.resultRecipientEmail,
            birthdate: candidateData.birthdate,
            'extra-time-percentage': candidateData.extraTimePercentage,
            'external-id': candidateData.externalId,
            'user-id': candidateData.userId,
            'session-id': candidateData.sessionId,
            'organization-learner-id': candidateData.organizationLearnerId,
            'authorized-to-start': candidateData.authorizedToStart,
            'billing-mode': candidateData.billingMode,
            'prepayment-code': candidateData.prepaymentCode,
            'has-seen-certification-instructions': candidateData.hasSeenCertificationInstructions,
            subscriptions: [
              {
                complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
                type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
              },
              {
                complementaryCertificationKey: null,
                type: SUBSCRIPTION_TYPES.CORE,
              },
            ],
          },
        },
      };

      // when
      const deserializedCandidate = await candidateSerializer.deserialize(candidateJsonApiData);

      // then
      expect(deserializedCandidate).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
          subscription: Frameworks.PRO_SANTE,
          subscriptions: [
            domainBuilder.certification.enrolment.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
            }),
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null }),
          ],
        }),
      );
    });
  });

  describe('#serializeForParticipation()', function () {
    it('should convert a EnrolledCandidate model object into JSON API data', function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        id: 123,
        firstName: 'Michel',
        lastName: 'Jacques',
        sex: 'M',
        birthPostalCode: 'somePostalCode1',
        birthINSEECode: 'someInseeCode1',
        birthCity: 'someBirthCity1',
        birthProvinceCode: 'someProvinceCode1',
        birthCountry: 'someBirthCountry1',
        email: 'michel.jacques@example.net',
        resultRecipientEmail: 'jeanette.jacques@example.net',
        externalId: 'MICHELJACQUES',
        birthdate: '1990-01-01',
        sessionId: 555,
        extraTimePercentage: null,
        userId: null,
        organizationLearnerId: null,
        billingMode: BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        subscriptions: [],
        subscription: Frameworks.PRO_SANTE,
        hasSeenCertificationInstructions: true,
        hasStartedTest: false,
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: candidate.id.toString(),
          attributes: {
            'first-name': candidate.firstName,
            'last-name': candidate.lastName,
            birthdate: candidate.birthdate,
            'has-seen-certification-instructions': true,
            'session-id': candidate.sessionId,
            'has-started-test': false,
            subscription: candidate.subscription,
            'double-certification-eligibility': false,
          },
        },
      };

      // when
      const jsonApi = candidateSerializer.serializeForParticipation(candidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });
  describe('#serialize()', function () {
    it('should convert a Candidate model object without subscriptions into JSON API data', function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        id: 123,
        firstName: 'Michel',
        lastName: 'Jacques',
        sex: 'M',
        birthPostalCode: 'somePostalCode1',
        birthINSEECode: 'someInseeCode1',
        birthCity: 'someBirthCity1',
        birthProvinceCode: 'someProvinceCode1',
        birthCountry: 'someBirthCountry1',
        email: 'michel.jacques@example.net',
        resultRecipientEmail: 'jeanette.jacques@example.net',
        externalId: 'MICHELJACQUES',
        birthdate: '1990-01-01',
        extraTimePercentage: null,
        userId: null,
        organizationLearnerId: null,
        billingMode: BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        subscription: Frameworks.PRO_SANTE,
        hasSeenCertificationInstructions: true,
        accessibilityAdjustmentNeeded: true,
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: candidate.id.toString(),
          attributes: {
            'first-name': candidate.firstName,
            'last-name': candidate.lastName,
            'billing-mode': candidate.billingMode,
            'prepayment-code': candidate.prepaymentCode,
            'birth-city': candidate.birthCity,
            'birth-province-code': candidate.birthProvinceCode,
            'birth-insee-code': candidate.birthINSEECode,
            'birth-postal-code': candidate.birthPostalCode,
            'birth-country': candidate.birthCountry,
            birthdate: candidate.birthdate,
            email: candidate.email,
            'result-recipient-email': candidate.resultRecipientEmail,
            'external-id': candidate.externalId,
            'extra-time-percentage': candidate.extraTimePercentage,
            'is-linked': candidate.isLinked,
            'organization-learner-id': candidate.organizationLearnerId,
            sex: candidate.sex,
            subscription: candidate.subscription,
            'has-seen-certification-instructions': true,
            'accessibility-adjustment-needed': true,
          },
        },
      };

      // when
      const jsonApi = candidateSerializer.serialize(candidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });

  describe('#serializeForSession()', function () {
    it('should convert a Candidate model object with subscriptions into JSON API data', function () {
      // given
      const sessionCandidate = domainBuilder.certification.enrolment.buildCandidate({
        id: 123,
        firstName: 'Michel',
        lastName: 'Jacques',
        sex: 'M',
        birthPostalCode: 'somePostalCode1',
        birthINSEECode: 'someInseeCode1',
        birthCity: 'someBirthCity1',
        birthProvinceCode: 'someProvinceCode1',
        birthCountry: 'someBirthCountry1',
        email: 'michel.jacques@example.net',
        resultRecipientEmail: 'jeanette.jacques@example.net',
        externalId: 'MICHELJACQUES',
        birthdate: '1990-01-01',
        extraTimePercentage: null,
        userId: 159,
        organizationLearnerId: null,
        billingMode: BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        hasSeenCertificationInstructions: true,
        subscription: Frameworks.DROIT,
        accessibilityAdjustmentNeeded: true,
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: sessionCandidate.id.toString(),
          attributes: {
            'first-name': sessionCandidate.firstName,
            'last-name': sessionCandidate.lastName,
            birthdate: sessionCandidate.birthdate,
            subscription: sessionCandidate.subscription,
          },
        },
      };

      // when
      const jsonApi = candidateSerializer.serializeForSession(sessionCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });
});
