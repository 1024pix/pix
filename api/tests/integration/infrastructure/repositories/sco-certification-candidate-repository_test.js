import _ from 'lodash';

import * as scoCertificationCandidateRepository from '../../../../lib/infrastructure/repositories/sco-certification-candidate-repository.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | SCOCertificationCandidate', function () {
  describe('#addNonEnrolledCandidatesToSession', function () {
    let sessionId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    it('adds only the unenrolled candidates', async function () {
      // given
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId1,
      });
      const scoCandidateAlreadySaved2 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId2,
      });
      const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId4 = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved1,
          organizationLearnerId: scoCandidateAlreadySaved1.organizationLearnerId,
        }),
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved2,
          organizationLearnerId: scoCandidateAlreadySaved2.organizationLearnerId,
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
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          organizationLearnerId: organizationLearnerId4,
          sessionId,
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
    });

    it('saves candidate subscriptions', async function () {
      // given
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId1,
      });
      const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId4 = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved1,
          organizationLearnerId: scoCandidateAlreadySaved1.organizationLearnerId,
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
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          organizationLearnerId: organizationLearnerId4,
          sessionId,
        }),
      ];

      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: scoCandidates,
      });

      // then
      const { count: subscriptionsCount } = await knex('certification-subscriptions').count().first();
      expect(subscriptionsCount).to.equal(2);
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
