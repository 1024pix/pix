import _ from 'lodash';

import * as scoCertificationCandidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/sco-certification-candidate-repository.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Integration | Repository | SCOCertificationCandidate', function () {
  describe('#addNonEnrolledCandidatesToSession', function () {
    let sessionId;
    let clock;
    const now = new Date('2024-06-17T00:00:00Z');

    beforeEach(function () {
      // given
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('adds only the unenrolled candidates', async function () {
      // given
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId1,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: scoCandidateAlreadySaved1.id });
      const scoCandidateAlreadySaved2 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId2,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: scoCandidateAlreadySaved2.id });
      const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId4 = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved1,
          organizationLearnerId: scoCandidateAlreadySaved1.organizationLearnerId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved2,
          organizationLearnerId: scoCandidateAlreadySaved2.organizationLearnerId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          firstName: 'Bobby',
          lastName: 'LaPointe',
          birthdate: '2001-01-04',
          sex: 'M',
          birthINSEECode: '75005',
          organizationLearnerId: organizationLearnerId3,
          sessionId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          organizationLearnerId: organizationLearnerId4,
          sessionId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
      ];

      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: scoCandidates,
      });

      // then
      const candidates = await knex('certification-candidates').select([
        'firstName',
        'lastName',
        'birthdate',
        'sex',
        'birthINSEECode',
        'organizationLearnerId',
        'sessionId',
      ]);
      const actualCandidates = candidatesToBeCompared(candidates);
      const expectedCandidates = candidatesToBeCompared(scoCandidates);
      expect(actualCandidates).to.exactlyContain(expectedCandidates);

      const { count: subscriptionsCount } = await knex('certification-subscriptions').count().first();
      expect(subscriptionsCount).to.equal(actualCandidates.length);
    });

    it('saves candidate subscriptions', async function () {
      // given
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        id: 1,
        sessionId,
        organizationLearnerId: organizationLearnerId1,
      });
      databaseBuilder.factory.buildCoreSubscription({
        certificationCandidateId: scoCandidateAlreadySaved1.id,
        createdAt: new Date('2024-01-01'),
      });
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildComplementaryCertification({
        id: 123,
        label: 'quelquechose',
        key: 'quelquechose',
      });
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved1,
          organizationLearnerId: scoCandidateAlreadySaved1.organizationLearnerId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          firstName: 'Bobby',
          lastName: 'LaPointe',
          birthdate: '2001-01-04',
          sex: 'M',
          birthINSEECode: '75005',
          organizationLearnerId: organizationLearnerId2,
          sessionId,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          organizationLearnerId: organizationLearnerId3,
          sessionId,
          subscriptions: [
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
            domainBuilder.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationId: 123,
            }),
          ],
        }),
      ];

      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: scoCandidates,
      });

      // then
      const subscriptions = await knex('certification-subscriptions');
      expect(subscriptions.length).to.equal(4);
      sinon.assert.match(subscriptions[0], {
        certificationCandidateId: scoCandidateAlreadySaved1.id,
        complementaryCertificationId: null,
        createdAt: new Date('2024-01-01'),
        type: SUBSCRIPTION_TYPES.CORE,
      });
      sinon.assert.match(subscriptions[1], {
        certificationCandidateId: sinon.match.number,
        complementaryCertificationId: null,
        createdAt: sinon.match.date,
        type: SUBSCRIPTION_TYPES.CORE,
      });
      sinon.assert.match(subscriptions[2], {
        certificationCandidateId: sinon.match.number,
        complementaryCertificationId: null,
        createdAt: sinon.match.date,
        type: SUBSCRIPTION_TYPES.CORE,
      });
      sinon.assert.match(subscriptions[3], {
        certificationCandidateId: sinon.match.number,
        complementaryCertificationId: sinon.match.number,
        createdAt: sinon.match.date,
        type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      });
    });

    it('does nothing when no candidate is given', async function () {
      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: [],
      });

      // then
      const candidates = await knex('certification-candidates').select();
      expect(candidates).to.be.empty;

      const { count: subscriptionsCount } = await knex('certification-subscriptions').count().first();
      expect(subscriptionsCount).to.equal(0);
    });
  });
});

function fieldsToBeCompared(candidate) {
  return _.pick(candidate, [
    'firstName',
    'lastName',
    'birthdate',
    'sex',
    'birthINSEECode',
    'organizationLearnerId',
    'sessionId',
  ]);
}

function candidatesToBeCompared(candidates) {
  return _.map(candidates, (candidate) => fieldsToBeCompared(candidate));
}
