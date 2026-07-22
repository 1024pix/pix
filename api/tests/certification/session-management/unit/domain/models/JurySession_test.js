import { JurySession } from '../../../../../../src/certification/session-management/domain/models/JurySession.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Session-Management | Domain | Models | JurySession', function () {
  it('should return a jury session', function () {
    // given

    // when
    const jurySession = new JurySession({
      id: 123,
      certificationCenterName: 'centerName',
      certificationCenterType: CERTIFICATION_CENTER_TYPES.SCO,
      certificationCenterId: 456,
      certificationCenterExternalId: 'externalId',
      address: 'adress',
      room: 'room',
      examiner: 'examiner',
      date: '2025-03-05',
      time: '12:00:00',
      accessCode: 'SCOS12',
      description: 'description',
      examinerGlobalComment: 'examinerComment',
      createdAt: new Date('2025-02-01'),
      finalizedAt: new Date('2025-03-01'),
      resultsSentToPrescriberAt: new Date('2025-03-02'),
      publishedAt: new Date('2025-03-03'),
      assignedCertificationOfficer: domainBuilder.buildCertificationOfficer({
        id: 2,
        firstName: 'Certif',
        lastName: 'Officer',
      }),
      juryComment: 'AJuryComment',
      juryCommentedAt: new Date('2025-01-01'),
      juryCommentAuthor: domainBuilder.buildCertificationOfficer({
        id: 3,
        firstName: 'JuryComment',
        lastName: 'Author',
      }),
      hasIncident: false,
      hasJoiningIssue: false,
      version: 3,
      counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters({
        startedCertifications: 1,
        certificationsWithScoringError: 2,
      }),
    });

    // then
    expect(jurySession).to.deep.equal({
      id: 123,
      certificationCenterName: 'centerName',
      certificationCenterType: CERTIFICATION_CENTER_TYPES.SCO,
      certificationCenterId: 456,
      certificationCenterExternalId: 'externalId',
      address: 'adress',
      room: 'room',
      examiner: 'examiner',
      date: '2025-03-05',
      time: '12:00:00',
      accessCode: 'SCOS12',
      description: 'description',
      examinerGlobalComment: 'examinerComment',
      createdAt: new Date('2025-02-01'),
      finalizedAt: new Date('2025-03-01'),
      resultsSentToPrescriberAt: new Date('2025-03-02'),
      publishedAt: new Date('2025-03-03'),
      assignedCertificationOfficer: {
        id: 2,
        firstName: 'Certif',
        lastName: 'Officer',
      },
      juryComment: 'AJuryComment',
      juryCommentedAt: new Date('2025-01-01'),
      juryCommentAuthor: {
        id: 3,
        firstName: 'JuryComment',
        lastName: 'Author',
      },
      hasIncident: false,
      hasJoiningIssue: false,
      version: 3,
      numberOfStartedCertifications: 1,
      numberOfScoringErrors: 2,
      totalNumberOfIssueReports: 0,
      numberOfImpactfullIssueReports: 0,
    });
  });

  context('should return the correct status', function () {
    it('should return a processed status', function () {
      // given

      // when
      const jurySession = new JurySession({
        id: 123,
        publishedAt: new Date('2025-03-03'),
        counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters(),
      });

      // then
      expect(jurySession.status).to.equal(SESSION_STATUSES.PROCESSED);
    });

    it('should return a in process status', function () {
      // given

      // when
      const jurySession = new JurySession({
        id: 123,
        publishedAt: null,
        assignedCertificationOfficer: domainBuilder.buildCertificationOfficer({
          id: 2,
          firstName: 'Certif',
          lastName: 'Officer',
        }),
        counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters(),
      });

      // then
      expect(jurySession.status).to.equal(SESSION_STATUSES.IN_PROCESS);
    });

    it('should return a finalized status', function () {
      // given

      // when
      const jurySession = new JurySession({
        id: 123,
        finalizedAt: new Date('2025-03-03'),
        counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters(),
      });

      // then
      expect(jurySession.status).to.equal(SESSION_STATUSES.FINALIZED);
    });

    it('should return a created status by default', function () {
      // given

      // when
      const jurySession = new JurySession({
        id: 123,
        counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters(),
      });

      // then
      expect(jurySession.status).to.equal(SESSION_STATUSES.CREATED);
    });
  });
});
