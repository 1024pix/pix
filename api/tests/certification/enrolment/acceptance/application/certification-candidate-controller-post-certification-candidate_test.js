import { SubscriptionTypes } from '../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';
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
    let certificationCandidate;
    let complementaryCertificationId;

    beforeEach(function () {
      certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        birthCountry: 'FRANCE',
        birthINSEECode: '75115',
        birthPostalCode: null,
        birthCity: null,
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
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-city': null,
            'birth-country': certificationCandidate.birthCountry,
            email: certificationCandidate.email,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            'external-id': certificationCandidate.externalId,
            birthdate: certificationCandidate.birthdate,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
            'birth-insee-code': certificationCandidate.birthINSEECode,
            'birth-postal-code': null,
            'billing-mode': 'FREE',
            sex: certificationCandidate.sex,
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
      expect(response.statusCode).to.equal(201);
    });

    it('should return the saved certification candidate', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.id).to.exist;
      expect(response.result.data.type).to.equal('certification-candidates');
    });

    it('should save the complementary certification subscriptions', async function () {
      // when
      await server.inject(options);

      // then
      const complementaryCertificationRegistrationsInDB = await knex('certification-subscriptions').select(
        'complementaryCertificationId',
        'type',
      );

      expect(complementaryCertificationRegistrationsInDB).to.have.deep.members([
        {
          complementaryCertificationId: null,
          type: SubscriptionTypes.CORE,
        },
        {
          complementaryCertificationId,
          type: SubscriptionTypes.COMPLEMENTARY,
        },
      ]);
    });
  });

  describe('#add', function () {
    let options;
    let payload;
    let sessionId;
    let userId;
    let certificationCandidate;
    let complementaryCertificationId;

    beforeEach(function () {
      certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        birthCountry: 'FRANCE',
        birthINSEECode: '75115',
        birthPostalCode: null,
        birthCity: null,
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
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-city': null,
            'birth-country': certificationCandidate.birthCountry,
            email: certificationCandidate.email,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            'external-id': certificationCandidate.externalId,
            birthdate: certificationCandidate.birthdate,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
            'birth-insee-code': certificationCandidate.birthINSEECode,
            'birth-postal-code': null,
            'billing-mode': 'FREE',
            sex: certificationCandidate.sex,
            subscription: {
              id: complementaryCertificationId,
              label: 'Certif complémentaire 1',
              key: 'CERTIF',
            },
          },
        },
      };
      options = {
        method: 'POST',
        url: `/api/sessions/${sessionId}/certification-candidate`,
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
      expect(response.statusCode).to.equal(201);
    });

    it('should return the saved certification candidate', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.id).to.exist;
      expect(response.result.data.type).to.equal('certification-candidates');
    });

    it('should save the complementary certification subscription', async function () {
      // when
      await server.inject(options);

      // then
      const complementaryCertificationRegistrationsInDB = await knex('certification-subscriptions').select(
        'complementaryCertificationId',
        'type',
      );

      expect(complementaryCertificationRegistrationsInDB).to.have.deep.members([
        {
          complementaryCertificationId: null,
          type: SubscriptionTypes.CORE,
        },
        {
          complementaryCertificationId,
          type: SubscriptionTypes.COMPLEMENTARY,
        },
      ]);
    });
  });
});
