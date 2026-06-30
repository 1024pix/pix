import { createServer } from '../../../../../server.js';
import { BILLING_MODES, SUBSCRIPTION_TYPES } from '../../../../../src/certification/shared/domain/constants.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
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
    let options;
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
        subscription: Frameworks.CLEA,
      });
      userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildOrganization({
        type: 'PRO',
        name: 'PRO_ORGANIZATION',
        externalId: 'EXTERNAL_ID',
      });

      const { id: certificationCenterId, name: certificationCenter } = databaseBuilder.factory.buildCertificationCenter(
        {
          name: 'PRO_CERTIFICATION_CENTER',
          type: 'PRO',
          externalId: 'EXTERNAL_ID',
        },
      );

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

      options = {
        method: 'POST',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
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
              subscription: Frameworks.CLEA,
            },
          },
        },
      };

      return databaseBuilder.commit();
    });

    context('with new subscription string format', function () {
      it('should respond with a 201 and save the candidate with the correct subscription', async function () {
        // when
        const response = await server.inject(options);

        // then
        const candidateId = parseInt(response.result.data.id);
        expect(response.statusCode).to.equal(201);
        const savedCandidate = await knex('certification-candidates').where({ id: candidateId }).first();
        expect(savedCandidate.subscription).to.equal(Frameworks.CLEA);
      });
    });

    context('with legacy subscriptions array format', function () {
      it('should respond with a 201 and derive subscription from subscriptions array', async function () {
        // given
        const legacyOptions = {
          ...options,
          payload: {
            data: {
              ...options.payload.data,
              attributes: {
                ...options.payload.data.attributes,
                subscription: undefined,
                subscriptions: [
                  { type: SUBSCRIPTION_TYPES.COMPLEMENTARY, complementaryCertificationKey: Frameworks.CLEA },
                  { type: SUBSCRIPTION_TYPES.CORE, complementaryCertificationKey: null },
                ],
              },
            },
          },
        };

        // when
        const response = await server.inject(legacyOptions);

        // then
        const candidateId = parseInt(response.result.data.id);
        expect(response.statusCode).to.equal(201);
        const savedCandidate = await knex('certification-candidates').where({ id: candidateId }).first();
        expect(savedCandidate.subscription).to.equal(Frameworks.CLEA);
      });
    });
  });
});
