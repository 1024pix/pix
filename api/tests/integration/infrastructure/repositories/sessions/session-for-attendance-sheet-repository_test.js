const { databaseBuilder, expect, catchErr } = require('../../../../test-helper');
const { NotFoundError } = require('../../../../../lib/domain/errors');
const sessionForAttendanceSheetRepository = require('../../../../../lib/infrastructure/repositories/sessions/session-for-attendance-sheet-repository');
const SessionForAttendanceSheet = require('../../../../../lib/domain/read-models/SessionForAttendanceSheet');
const CertificationCandidateForAttendanceSheet = require('../../../../../lib/domain/read-models/CertificationCandidateForAttendanceSheet');

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

        const schoolingRegistration1 = databaseBuilder.factory.buildOrganizationLearner({ division: '3b' });
        const schoolingRegistration2 = databaseBuilder.factory.buildOrganizationLearner({ division: '3a' });
        const schoolingRegistration3 = databaseBuilder.factory.buildOrganizationLearner({ division: '2c' });
        const candidate1 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Michael',
          sessionId: session.id,
          organizationLearnerId: schoolingRegistration1.id,
        });
        const candidate2 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Stardust',
          firstName: 'Ziggy',
          sessionId: session.id,
          organizationLearnerId: schoolingRegistration2.id,
        });
        const candidate3 = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Jackson',
          firstName: 'Janet',
          sessionId: session.id,
          organizationLearnerId: schoolingRegistration3.id,
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

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionForAttendanceSheetRepository.getWithCertificationCandidates)(12434354);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
