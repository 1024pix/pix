const Session = require('../../../../lib/domain/models/Session');
const { expect } = require('../../../test-helper');
const _ = require('lodash');
const { domainBuilder } = require('../../../test-helper');

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
      session.generateSupervisorPassword();

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
});

context('#generateSupervisorPassword', function () {
  it('should return a supervisor password containing 5 digits/letters except 0, 1 and vowels', async function () {
    // when
    const session = domainBuilder.buildSession();
    session.generateSupervisorPassword();

    // then
    expect(session.supervisorPassword).to.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/);
  });
});
