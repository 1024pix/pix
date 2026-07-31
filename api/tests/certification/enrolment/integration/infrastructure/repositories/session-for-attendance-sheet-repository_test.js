import { CertificationCandidateForAttendanceSheet } from '../../../../../../src/certification/enrolment/domain/read-models/CertificationCandidateForAttendanceSheet.js';
import { SessionForAttendanceSheet } from '../../../../../../src/certification/enrolment/domain/read-models/SessionForAttendanceSheet.js';
import * as sessionForAttendanceSheetRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/session-for-attendance-sheet-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Session-for-attendance-sheet', function () {
  describe('#getWithCertificationCandidates', function () {
    context('when there are no organization learners', function () {
      it('should return session information with ordered candidates and no division', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'eXt1234', isManagingStudents: true });
        databaseBuilder.factory.buildOrganization({ type: 'SUP', externalId: 'EXt1234', isManagingStudents: false });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'Tour Gamma',
          type: 'SUP',
          externalId: 'Ext1234',
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

        const candidate1 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Jackson',
            firstName: 'Michael',
          })
          .withParameters({
            sessionId: session.id,
          })
          .insertToDB({ databaseBuilder });

        const candidate2 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Stardust',
            firstName: 'Ziggy',
          })
          .withParameters({
            sessionId: session.id,
          })
          .insertToDB({ databaseBuilder });

        const candidate3 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Jackson',
            firstName: 'Janet',
          })
          .withParameters({
            sessionId: session.id,
          })
          .insertToDB({ databaseBuilder });

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
        const actualSession = await sessionForAttendanceSheetRepository.getWithCertificationCandidates({
          id: session.id,
        });

        // then
        expect(actualSession).to.deepEqualInstance(expectedSessionValues);
      });
    });

    context('when there are organization learners', function () {
      it('should return session information with with ordered candidates and division', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'Ext1234', isManagingStudents: true });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'Tour Gamma',
          type: 'SCO',
          externalId: 'eXT1234',
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

        const candidate1 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Jackson',
            firstName: 'Michael',
          })
          .withParameters({
            sessionId: session.id,
          })
          .asScoCandidate({
            organizationLearnerId: organizationLearner1.id,
          })
          .insertToDB({ databaseBuilder });

        const candidate2 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Stardust',
            firstName: 'Ziggy',
          })
          .withParameters({
            sessionId: session.id,
          })
          .asScoCandidate({
            organizationLearnerId: organizationLearner2.id,
          })
          .insertToDB({ databaseBuilder });

        const candidate3 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            lastName: 'Jackson',
            firstName: 'Janet',
          })
          .withParameters({
            sessionId: session.id,
          })
          .asScoCandidate({
            organizationLearnerId: organizationLearner3.id,
          })
          .insertToDB({ databaseBuilder });

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
        const actualSession = await sessionForAttendanceSheetRepository.getWithCertificationCandidates({
          id: session.id,
        });

        // then
        expect(actualSession).to.deepEqualInstance(expectedSessionValues);
      });
    });

    context('when no session was found', function () {
      it('should return a Not found error', async function () {
        // when
        const error = await catchErr(sessionForAttendanceSheetRepository.getWithCertificationCandidates)({
          id: 12434354,
        });

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
        const error = await catchErr(sessionForAttendanceSheetRepository.getWithCertificationCandidates)({
          id: sessionId,
        });

        // then<
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
