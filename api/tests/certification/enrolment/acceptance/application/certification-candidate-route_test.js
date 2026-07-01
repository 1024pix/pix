import dayjs from 'dayjs';

import { createServer } from '../../../../../server.js';
import { CandidateCreatedEvent } from '../../../../../src/certification/enrolment/domain/models/timeline/CandidateCreatedEvent.js';
import { CandidateNotCertifiableEvent } from '../../../../../src/certification/enrolment/domain/models/timeline/CandidateNotCertifiableEvent.js';
import { CandidateReconciledEvent } from '../../../../../src/certification/enrolment/domain/models/timeline/CandidateReconciledEvent.js';
import { BILLING_MODES } from '../../../../../src/certification/shared/domain/constants.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { ROLES } = PIX_ADMIN;

describe('Certification | Enrolment | Acceptance | Application | Routes | certification-candidate-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sessions/{sessionId}/certification-candidates', function () {
    it('should respond with a 201', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99100',
        originalName: 'FRANCE',
      });
      databaseBuilder.factory.buildCertificationCpfCity({
        name: 'PARIS 15',
        INSEECode: '75015',
      });
      await databaseBuilder.commit();

      // when
      const options = {
        method: 'POST',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        payload: {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': 'Jean',
              'last-name': 'Ris',
              'birth-city': null,
              'birth-province-code': null,
              'birth-country': 'FRANCE',
              'birth-postal-code': null,
              'birth-insee-code': '75015',
              'result-recipient-email': null,
              'external-id': null,
              'extra-time-percentage': null,
              'billing-mode': BILLING_MODES.FREE,
              'prepayment-code': null,
              sex: 'M',
              email: null,
              birthdate: '2000-10-10',
              'organization-learner-id': null,
              subscription: Frameworks.CLEA,
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterUserId, source: 'pix-certif' }),
      };

      // when
      const response = await server.inject(options);

      // then
      const createdCandidate = await knex.select('firstName', 'lastName').from('certification-candidates').first();

      expect(response.statusCode).to.equal(201);
      expect(createdCandidate).to.deep.equal({ firstName: 'Jean', lastName: 'Ris' });
    });
  });

  describe('GET /api/sessions/{sessionId}/certification-candidates', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser({}).id;
      databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        billingMode: BILLING_MODES.PREPAID,
      }).id;
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterUserId, source: 'pix-certif' }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        '{"data":[{"type":"certification-candidates","id":"1001","attributes":{"first-name":"first-name","last-name":"last-name","birthdate":"2000-01-04","birth-province-code":null,"birth-city":"PARIS 1","birth-country":"France","email":"somemail@example.net","result-recipient-email":"somerecipientmail@example.net","external-id":"externalId","extra-time-percentage":0.3,"is-linked":true,"organization-learner-id":null,"sex":"M","birth-insee-code":"75101","birth-postal-code":null,"subscription":"CORE","billing-mode":"PREPAID","prepayment-code":null,"has-seen-certification-instructions":false,"accessibility-adjustment-needed":false}}]}',
      );
    });
  });

  describe('GET /api/admin/sessions/{sessionId}/certification-candidates', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser({}).id;
      databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        billingMode: BILLING_MODES.PREPAID,
      }).id;
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/admin/sessions/${sessionId}/certification-candidates`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterUserId, source: 'pix-admin' }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        '{"data":[{"type":"certification-candidates","id":"1001","attributes":{"first-name":"first-name","last-name":"last-name","birthdate":"2000-01-04","subscription":"CORE"}}]}',
      );
    });
  });

  describe('PATCH /api/certification-candidates/{certificationCandidateId}/validate-certification-instructions', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser().id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        hasSeenCertificationInstructions: false,
      }).id;

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'PATCH',
        url: `/api/certification-candidates/${candidateId}/validate-certification-instructions`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: candidateUserId, source: 'pix' }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            birthdate: '2000-01-04',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'first-name': 'first-name',
            'has-seen-certification-instructions': true,
            'has-started-test': false,
            'last-name': 'last-name',
            'session-id': sessionId,
          },
          id: '1001',
          type: 'certification-candidates',
        },
      });
    });
  });

  describe('GET /api/certification-candidates/{certificationCandidateId}', function () {
    it('should respond with a 200 and candidate information', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser().id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        firstName: 'Lemmy',
        lastName: 'Kilmister',
        birthdate: '1945-12-24',
        hasSeenCertificationInstructions: true,
      }).id;

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/certification-candidates/${candidateId}`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: candidateUserId, source: 'pix' }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            birthdate: '1945-12-24',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'first-name': 'Lemmy',
            'has-seen-certification-instructions': true,
            'has-started-test': false,
            'last-name': 'Kilmister',
            'session-id': sessionId,
          },
          id: '1001',
          type: 'certification-candidates',
        },
      });
    });
  });

  describe('PATCH /api/sessions/{sessionId}/certification-candidates/{certificationCandidateId}', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, version: 3 }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: null,
        billingMode: BILLING_MODES.PREPAID,
        accessibilityAdjustmentNeeded: false,
      }).id;
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${sessionId}/certification-candidates/${candidateId}`,
        payload: {
          data: {
            attributes: {
              'accessibility-adjustment-needed': true,
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterUserId, source: 'pix-certif' }),
      };

      // when
      const response = await server.inject(options);

      // then
      const [{ accessibilityAdjustmentNeeded: candidateAccessibilityAdjustmentNeededExpected }] = await knex
        .select('accessibilityAdjustmentNeeded')
        .from('certification-candidates')
        .where({ id: candidateId });
      expect(candidateAccessibilityAdjustmentNeededExpected).to.equal(true);
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('DELETE /api/sessions/{sessionId}/certification-candidates/{certificationCandidateId}', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, version: 3 }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: null,
        billingMode: BILLING_MODES.PREPAID,
      }).id;
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'DELETE',
        url: `/api/sessions/${sessionId}/certification-candidates/${candidateId}`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterUserId, source: 'pix-certif' }),
      };

      // when
      const response = await server.inject(options);

      // then
      const candidate = await knex.from('certification-candidates').where({ id: candidateId }).first();
      const candidateSubscription = await knex
        .from('certification-subscriptions')
        .where({ certificationCandidateId: candidateId })
        .first();

      expect(response.statusCode).to.equal(204);
      expect(candidate).to.be.undefined;
      expect(candidateSubscription).to.be.undefined;
    });
  });

  describe('GET /api/admin/certification-candidates/{certificationCandidateId}/timeline', function () {
    it('should respond with a 200 and timeline', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const sessionId = databaseBuilder.factory.buildSession().id;
      const candidateUserId = databaseBuilder.factory.buildUser().id;
      const createdAt = dayjs().toDate();
      const reconciledAt = dayjs().add('1', 'hour').toDate();
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId: candidateUserId,
        createdAt,
        reconciledAt,
      }).id;
      databaseBuilder.factory.buildCoreSubscription({
        certificationCandidateId: candidateId,
      });

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/admin/certification-candidates/${candidateId}/timeline`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            events: [
              {
                code: CandidateCreatedEvent.name,
                when: createdAt,
                metadata: null,
              },
              {
                code: CandidateReconciledEvent.name,
                when: reconciledAt,
                metadata: null,
              },
              {
                code: CandidateNotCertifiableEvent.name,
                when: reconciledAt,
                metadata: null,
              },
            ],
          },
          id: `${candidateId}`,
          type: 'certification-candidate-timelines',
        },
      });
    });
  });
});
