import _ from 'lodash';

import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

const SESSION_PROPS = [
  'id',
  'accessCode',
  'address',
  'certificationCenter',
  'date',
  'description',
  'examiner',
  'room',
  'time',
  'examinerGlobalComment',
  'hasIncident',
  'hasJoiningIssue',
  'finalizedAt',
  'resultsSentToPrescriberAt',
  'publishedAt',
  'certificationCandidates',
  'certificationCenterId',
  'assignedCertificationOfficerId',
  'invigilatorPassword',
  'version',
  'createdBy',
];

describe('Unit | Certification | Session | Domain | Models | SessionManagement', function () {
  let session;

  beforeEach(function () {
    session = new SessionManagement({
      id: 'id',
      accessCode: '',
      address: '',
      certificationCenter: '',
      date: '',
      description: '',
      examiner: '',
      room: '',
      time: '',
      examinerGlobalComment: '',
      hasIncident: '',
      hasJoiningIssue: '',
      finalizedAt: '',
      resultsSentToPrescriberAt: '',
      publishedAt: '',
      // includes
      certificationCandidates: [],
      // references
      certificationCenterId: '',
      assignedCertificationOfficerId: '',
      createdBy: '',
    });
  });

  it('should create an object of the Session type', function () {
    expect(session).to.be.instanceOf(SessionManagement);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#areResultsFlaggedAsSent', function () {
    context('when session resultsSentToPrescriberAt timestamp is defined', function () {
      it('should return true', function () {
        // given
        session.resultsSentToPrescriberAt = new Date();

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.true;
      });
    });

    context('when session resultsSentToPrescriberAt timestamp is falsy', function () {
      it('should return false', function () {
        // given
        session.resultsSentToPrescriberAt = null;

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.false;
      });
    });
  });

  context('#get status', function () {
    context('when session publishedAt timestamp is defined', function () {
      it('should return PROCESSED', function () {
        // given
        session.publishedAt = new Date();

        // when
        const status = session.status;

        // then
        expect(status).to.equal(SESSION_STATUSES.PROCESSED);
      });
    });

    context('when session publishedAt timestamp is not defined', function () {
      context('when session assignedCertificationOfficerId is defined', function () {
        it('should return IN_PROCESS', function () {
          // given
          session.assignedCertificationOfficerId = 123;

          // when
          const status = session.status;

          // then
          expect(status).to.equal(SESSION_STATUSES.IN_PROCESS);
        });
      });

      context('when session assignedCertificationOfficerId is not defined', function () {
        context('when session finalizedAt timestamp is defined', function () {
          it('should return FINALIZED', function () {
            // given
            session.finalizedAt = new Date();

            // when
            const status = session.status;

            // then
            expect(status).to.equal(SESSION_STATUSES.FINALIZED);
          });
        });

        context('when session finalizedAt timestamp is not defined', function () {
          it('should return CREATED', function () {
            // when
            const status = session.status;

            // then
            expect(status).to.equal(SESSION_STATUSES.CREATED);
          });
        });
      });
    });
  });

  context('#isPublished', function () {
    it('returns true when the session is published', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession({ publishedAt: new Date() });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.true;
    });

    it('returns false when the session is not published', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession({ publishedAt: null });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.false;
    });
  });

  context('#isAccessible', function () {
    it('returns true when the session is created', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.created();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.true;
    });

    it('returns false when the session is finalized', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.finalized();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is in process', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.inProcess();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is processed', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.processed();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });
  });

  context('#isSupervisable', function () {
    it('should return true when the invigilator password match', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.created();

      // when
      const isSupervisable = session.isSupervisable(session.invigilatorPassword);

      // then
      expect(isSupervisable).to.be.true;
    });

    it('should return false when the invigilator password does not match', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSession.created();

      // when
      const isSupervisable = session.isSupervisable('NOT_MATCHING-SUPERVISOR_PASSWORD');

      // then
      expect(isSupervisable).to.be.false;
    });
  });
});
