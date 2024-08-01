import { SubscriptionTypes } from '../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';
import { CertificationCandidate } from '../../../../../src/shared/domain/models/index.js';
import { clearResolveMx, setResolveMx } from '../../../../../src/shared/mail/infrastructure/services/mail-check.js';
import {
  createServer,
  databaseBuilder,
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  sinon,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | Certification | Enrolment | session-controller-post-certification-candidate', function () {
  let server;
  let resolveMx;

  beforeEach(async function () {
    server = await createServer();
    resolveMx = sinon.stub();
    resolveMx.resolves();
    setResolveMx(resolveMx);
  });

  afterEach(async function () {
    server = await createServer();
    clearResolveMx();
  });

  describe('#save', function () {
    let options;
    let payload;
    let sessionId;
    let userId;
    let candidate;
    let complementaryCertificationId;

    beforeEach(function () {
      candidate = domainBuilder.certification.enrolment.buildCandidate({
        birthCountry: 'FRANCE',
        birthINSEECode: '75115',
        birthPostalCode: null,
        birthCity: null,
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
        subscriptions: [domainBuilder.buildCoreSubscription()],
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
        name: 'FRANCE',
        code: '99100',
        matcher: 'ACEFNR',
      });
      databaseBuilder.factory.buildCertificationCpfCity({
        name: 'PARIS 15',
        INSEECode: '75115',
      });
      complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Certif complémentaire 1',
      }).id;

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
            'has-seen-end-test-screen': candidate.hasSeenEndTestScreen,
            'birth-insee-code': candidate.birthINSEECode,
            'birth-postal-code': null,
            'billing-mode': 'FREE',
            sex: candidate.sex,
            'complementary-certification': {
              id: complementaryCertificationId,
              label: 'Certif complémentaire 1',
              key: 'CERTIF',
            },
          },
        },
      };
      options = {
        method: 'POST',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
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

    it('should save subscriptions (core default and complementary if any)', async function () {
      // when
      const response = await server.inject(options);

      // then
      const subscriptions = await knex('certification-subscriptions')
        .select(['type', 'complementaryCertificationId'])
        .where({ certificationCandidateId: parseInt(response.result.data.id) })
        .orderBy('type');
      expect(subscriptions.length).to.equal(2);
      expect(subscriptions[0]).to.deep.equal({
        type: SubscriptionTypes.COMPLEMENTARY,
        complementaryCertificationId,
      });
      expect(subscriptions[1]).to.deep.equal({
        type: SubscriptionTypes.CORE,
        complementaryCertificationId: null,
      });
    });
  });
});
