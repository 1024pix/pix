import Session from '../../../../lib/domain/models/Session';
import { expect, sinon } from '../../../test-helper';
import _ from 'lodash';
import { domainBuilder } from '../../../test-helper';

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
  'supervisorPassword',
];

describe('Unit | Domain | Models | Session', function () {
  let session;

  beforeEach(function () {
    session = new Session({
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
    });
  });

  it('should create an object of the Session type', function () {
    expect(session).to.be.instanceOf(Session);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  it('should default a supervisor password property containing 5 digits/letters except 0, 1 and vowels', async function () {
    // given
    // when
    const session = new Session();

    // then
    expect(session.supervisorPassword).to.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/);
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
        expect(status).to.equal(Session.statuses.PROCESSED);
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
          expect(status).to.equal(Session.statuses.IN_PROCESS);
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
            expect(status).to.equal(Session.statuses.FINALIZED);
          });
        });

        context('when session finalizedAt timestamp is not defined', function () {
          it('should return CREATED', function () {
            // when
            const status = session.status;

            // then
            expect(status).to.equal(Session.statuses.CREATED);
          });
        });
      });
    });
  });

  context('#isPublished', function () {
    it('returns true when the session is published', function () {
      // given
      const session = domainBuilder.buildSession({ publishedAt: new Date() });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.true;
    });

    it('returns false when the session is not published', function () {
      // given
      const session = domainBuilder.buildSession({ publishedAt: null });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.false;
    });
  });

  context('#isAccessible', function () {
    it('returns true when the session is created', function () {
      // given
      const session = domainBuilder.buildSession.created();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.true;
    });

    it('returns false when the session is finalized', function () {
      // given
      const session = domainBuilder.buildSession.finalized();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is in process', function () {
      // given
      const session = domainBuilder.buildSession.inProcess();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is processed', function () {
      // given
      const session = domainBuilder.buildSession.processed();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });
  });

  context('#isSupervisable', function () {
    it('should return true when the supervisor password match', function () {
      // given
      const session = domainBuilder.buildSession.created();

      // when
      const isSupervisable = session.isSupervisable(session.supervisorPassword);

      // then
      expect(isSupervisable).to.be.true;
    });

    it('should return false when the supervisor password does not match', function () {
      // given
      const session = domainBuilder.buildSession.created();

      // when
      const isSupervisable = session.isSupervisable('NOT_MATCHING-SUPERVISOR_PASSWORD');

      // then
      expect(isSupervisable).to.be.false;
    });
  });

  context('#canEnrollCandidate', function () {
    it('should return true when session is not finalized', function () {
      // given
      const session = domainBuilder.buildSession.created();

      // when
      const result = session.canEnrollCandidate();

      // then
      expect(result).to.be.true;
    });

    it('should return false when session is not finalized', function () {
      // given
      const session = domainBuilder.buildSession.finalized();

      // when
      const result = session.canEnrollCandidate();

      // then
      expect(result).to.be.false;
    });
  });

  context('static #generateSupervisorPassword', function () {
    it('should return a supervisor password containing 5 digits/letters except 0, 1 and vowels', async function () {
      // given
      // when
      const supervisorPassword = Session.generateSupervisorPassword();

      // then
      expect(supervisorPassword).to.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/);
    });
  });

  context('#isSessionScheduledInThePast', function () {
    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when session is scheduled in the past', function () {
      it('should return true', async function () {
        // given
        const session = domainBuilder.buildSession({ date: '2022-01-01' });

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.true;
      });
    });

    context('when session is not scheduled in the past', function () {
      it('should return false', async function () {
        // given
        const session = domainBuilder.buildSession({ date: '2024-01-01' });

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.false;
      });
    });
  });
});
