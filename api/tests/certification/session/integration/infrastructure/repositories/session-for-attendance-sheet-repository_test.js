import { databaseBuilder, expect, catchErr } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import * as sessionForAttendanceSheetRepository from '../../../../../../src/certification/session/infrastructure/repositories/session-for-attendance-sheet-repository.js';
import { SessionForAttendanceSheet } from '../../../../../../src/certification/session/domain/read-models/SessionForAttendanceSheet.js';
import { CertificationCandidateForAttendanceSheet } from '../../../../../../src/certification/session/domain/read-models/CertificationCandidateForAttendanceSheet.js';

describe('Integration | Repository | Session-for-attendance-sheet', function () {
  describe('#getWithCertificationCandidates', function () {
    context('when there are no organization learners', function () {
      it('should return session information with ordered candidates and no division', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'EXT1234', isManagingStudents: true });
        databaseBuilder.factory.buildOrganization({ type: 'SUP', externalId: 'EXT1234', isManagingStudents: false });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'Tour Gamma',
          type: 'SUP',
          externalId: 'EXT1234',
        });

        const session = databaseBuilder.factory.buildSession({
          id: 1234,
          certificationCenter: 'Tour Gamma',
          certificationCenterId: certificationCenter.id,
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
        });

        const candidate1 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
        });
        const candidate2 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
        });
        const candidate3 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
        });

        await databaseBuilder.commit();

        const expectedSessionValues = new SessionForAttendanceSheet({
          id: 1234,
          certificationCenterName: 'Tour Gamma',
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          certificationCenterType: 'SUP',
          isOrganizationManagingStudents: false,
          certificationCandidates: [
            new CertificationCandidateForAttendanceSheet({ ...candidate3, division: null }),
            new CertificationCandidateForAttendanceSheet({ ...candidate1, division: null }),
            new CertificationCandidateForAttendanceSheet({ ...candidate2, division: null }),
          ],
        });

        // when
        const actualSession = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(session.id);

        // then
        expect(actualSession).to.deepEqualInstance(expectedSessionValues);
      });
    });

    context('when there are organization learners', function () {
      it('should return session information with with ordered candidates and division', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'EXT1234', isManagingStudents: true });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'Tour Gamma',
          type: 'SCO',
          externalId: 'EXT1234',
        });

        const session = databaseBuilder.factory.buildSession({
          id: 1234,
          certificationCenter: 'Tour Gamma',
          certificationCenterId: certificationCenter.id,
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
        });

        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({ division: '3b' });
        const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({ division: '3a' });
        const organizationLearner3 = databaseBuilder.factory.buildOrganizationLearner({ division: '2c' });
        const candidate1 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          organizationLearnerId: organizationLearner1.id,
        });
        const candidate2 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
          organizationLearnerId: organizationLearner2.id,
        });
        const candidate3 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
          organizationLearnerId: organizationLearner3.id,
        });
        await databaseBuilder.commit();

        const expectedSessionValues = new SessionForAttendanceSheet({
          id: 1234,
          certificationCenterName: 'Tour Gamma',
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          certificationCenterType: 'SCO',
          isOrganizationManagingStudents: true,
          certificationCandidates: [
            new CertificationCandidateForAttendanceSheet({ ...candidate3, division: '2c' }),
            new CertificationCandidateForAttendanceSheet({ ...candidate1, division: '3b' }),
            new CertificationCandidateForAttendanceSheet({ ...candidate2, division: '3a' }),
          ],
        });

        // when
        const actualSession = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(session.id);

        // then
        expect(actualSession).to.deepEqualInstance(expectedSessionValues);
      });
    });

    context('when no session was found', function () {
      it('should return a Not found error', async function () {
        // when
        const error = await catchErr(sessionForAttendanceSheetRepository.getWithCertificationCandidates)(12434354);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when no certification candidates was found', function () {
      it('should return a Not found error', async function () {
        // given
        const sessionId = 1234;
        databaseBuilder.factory.buildSession({ id: sessionId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(sessionForAttendanceSheetRepository.getWithCertificationCandidates)(sessionId);

        // then<
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
