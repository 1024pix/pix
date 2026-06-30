import { createServer } from '../../../../../server.js';
import { BILLING_MODES, SUBSCRIPTION_TYPES } from '../../../../../src/certification/shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | Certification | Enrolment | session-controller-post-certification-candidate', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#add', function () {
    const cleaCertificationId = 123;

    beforeEach(function () {
      databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
        id: cleaCertificationId,
      });

      return databaseBuilder.commit();
    });

    context('before compatibility', function () {
      let options;
      let payload;
      let sessionId;
      let userId;
      let candidate;

      beforeEach(function () {
        candidate = domainBuilder.certification.enrolment.buildCandidate({
          birthCountry: 'FRANCE',
          birthINSEECode: '75115',
          birthPostalCode: null,
          birthCity: null,
          billingMode: BILLING_MODES.FREE,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });
        userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganization({
          type: 'PRO',
          name: 'PRO_ORGANIZATION',
          externalId: 'EXTERNAL_ID',
        });

        const { id: certificationCenterId, name: certificationCenter } =
          databaseBuilder.factory.buildCertificationCenter({
            name: 'PRO_CERTIFICATION_CENTER',
            type: 'PRO',
            externalId: 'EXTERNAL_ID',
          });

        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        databaseBuilder.factory.buildCertificationCpfCountry({
          commonName: 'FRANCE',
          originalName: 'FRANCE',
          code: '99100',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          name: 'PARIS 15',
          INSEECode: '75115',
        });

        payload = {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': candidate.firstName,
              'last-name': candidate.lastName,
              'birth-city': null,
              'birth-country': candidate.birthCountry,
              email: candidate.email,
              'result-recipient-email': candidate.resultRecipientEmail,
              'external-id': candidate.externalId,
              birthdate: candidate.birthdate,
              'extra-time-percentage': candidate.extraTimePercentage,
              'birth-insee-code': candidate.birthINSEECode,
              'birth-postal-code': null,
              'billing-mode': 'FREE',
              sex: candidate.sex,
              subscriptions: [
                {
                  type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
                  complementaryCertificationKey: ComplementaryCertificationKeys.CLEA,
                },
                {
                  type: SUBSCRIPTION_TYPES.CORE,
                  complementaryCertificationKey: null,
                },
              ],
            },
          },
        };
        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload,
        };

        return databaseBuilder.commit();
      });

      it('should respond with a 201 created', async function () {
        // when
        const response = await server.inject(options);

        // then
        const [candidateId] = await knex('certification-candidates').pluck('id');
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.id).to.equal(candidateId.toString());
        expect(response.result.data.type).to.equal('certification-candidates');
      });

      it('should save the complete candidate in database', async function () {
        // when
        const response = await server.inject(options);

        // then
        const candidateId = parseInt(response.result.data.id);
        const savedCandidate = await knex('certification-candidates').where({ id: candidateId }).first();

        expect(savedCandidate).to.contain({
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          sex: candidate.sex,
          birthdate: candidate.birthdate,
          birthCountry: 'FRANCE',
          birthINSEECode: '75115',
          birthCity: 'PARIS 15',
          birthPostalCode: null,
          birthProvinceCode: null,
          email: candidate.email,
          resultRecipientEmail: candidate.resultRecipientEmail,
          externalId: candidate.externalId,
          extraTimePercentage: '0.30',
          billingMode: 'FREE',
          prepaymentCode: null,
          sessionId,
          userId: null,
          organizationLearnerId: null,
          authorizedToStart: false,
          hasSeenCertificationInstructions: false,
          subscription: ComplementaryCertificationKeys.CLEA,
        });
      });

      it('should save subscriptions (core and complementary if any)', async function () {
        // when
        const response = await server.inject(options);

        // then
        const subscriptions = await knex('certification-subscriptions')
          .select(['type', 'complementaryCertificationId'])
          .where({ certificationCandidateId: parseInt(response.result.data.id) })
          .orderBy('type');
        expect(subscriptions).to.have.lengthOf(2);
        expect(subscriptions[0]).to.deep.equal({
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId: cleaCertificationId,
        });
        expect(subscriptions[1]).to.deep.equal({
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        });
      });
    });

    context('after compatibility', function () {
      let options;
      let payload;
      let sessionId;
      let userId;
      let candidate;

      beforeEach(function () {
        candidate = domainBuilder.certification.enrolment.buildCandidate({
          birthCountry: 'FRANCE',
          birthINSEECode: '75115',
          birthPostalCode: null,
          birthCity: null,
          billingMode: BILLING_MODES.FREE,
          subscriptions: [],
        });
        userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganization({
          type: 'PRO',
          name: 'PRO_ORGANIZATION',
          externalId: 'EXTERNAL_ID',
        });

        const { id: certificationCenterId, name: certificationCenter } =
          databaseBuilder.factory.buildCertificationCenter({
            name: 'PRO_CERTIFICATION_CENTER',
            type: 'PRO',
            externalId: 'EXTERNAL_ID',
          });

        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        databaseBuilder.factory.buildCertificationCpfCountry({
          originalName: 'FRANCE',
          code: '99100',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          name: 'PARIS 15',
          INSEECode: '75115',
        });

        payload = {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': candidate.firstName,
              'last-name': candidate.lastName,
              'birth-city': null,
              'birth-country': candidate.birthCountry,
              email: candidate.email,
              'result-recipient-email': candidate.resultRecipientEmail,
              'external-id': candidate.externalId,
              birthdate: candidate.birthdate,
              'extra-time-percentage': candidate.extraTimePercentage,
              'birth-insee-code': candidate.birthINSEECode,
              'birth-postal-code': null,
              'billing-mode': 'FREE',
              sex: candidate.sex,
              subscriptions: [
                {
                  type: SUBSCRIPTION_TYPES.CORE,
                  complementaryCertificationKey: null,
                },
                {
                  type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
                  complementaryCertificationKey: ComplementaryCertificationKeys.CLEA,
                },
              ],
            },
          },
        };
        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload,
        };

        return databaseBuilder.commit();
      });

      it('should respond with a 201 created and save subscriptions', async function () {
        // when
        const response = await server.inject(options);

        // then
        const [candidateId] = await knex('certification-candidates').pluck('id');
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.id).to.equal(candidateId.toString());
        expect(response.result.data.type).to.equal('certification-candidates');
        const subscriptions = await knex('certification-subscriptions')
          .select(['type', 'complementaryCertificationId'])
          .where({ certificationCandidateId: parseInt(response.result.data.id) })
          .orderBy('type');
        expect(subscriptions).to.have.lengthOf(2);
        expect(subscriptions[0]).to.deep.equal({
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId: cleaCertificationId,
        });
        expect(subscriptions[1]).to.deep.equal({
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        });
      });
    });
  });
});
