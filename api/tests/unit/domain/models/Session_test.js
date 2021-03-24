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
];

describe('Unit | Domain | Models | Session', function() {
  let session;

  beforeEach(function() {
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

  it('should create an object of the Session type', function() {
    expect(session).to.be.instanceOf(Session);
  });

  it('should create a session with all the requires properties', function() {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#areResultsFlaggedAsSent', function() {
    context('when session resultsSentToPrescriberAt timestamp is defined', function() {

      it('should return true', function() {
        // given
        session.resultsSentToPrescriberAt = new Date();

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.true;
      });
    });
    context('when session resultsSentToPrescriberAt timestamp is falsy', function() {

      it('should return false', function() {
        // given
        session.resultsSentToPrescriberAt = null;

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.false;
      });
    });
  });

  context('#get status', function() {

    context('when session publishedAt timestamp is defined', function() {

      it('should return PROCESSED', function() {
        // given
        session.publishedAt = new Date();

        // when
        const status = session.status;

        // then
        expect(status).to.equal(Session.statuses.PROCESSED);
      });
    });

    context('when session publishedAt timestamp is not defined', function() {

      context('when session assignedCertificationOfficerId is defined', function() {

        it('should return IN_PROCESS', function() {
          // given
          session.assignedCertificationOfficerId = 123;

          // when
          const status = session.status;

          // then
          expect(status).to.equal(Session.statuses.IN_PROCESS);
        });
      });

      context('when session assignedCertificationOfficerId is not defined', function() {

        context('when session finalizedAt timestamp is defined', function() {

          it('should return FINALIZED', function() {
            // given
            session.finalizedAt = new Date();

            // when
            const status = session.status;

            // then
            expect(status).to.equal(Session.statuses.FINALIZED);
          });
        });

        context('when session finalizedAt timestamp is not defined', function() {

          it('should return CREATED', function() {
            // when
            const status = session.status;

            // then
            expect(status).to.equal(Session.statuses.CREATED);
          });
        });
      });
    });
  });

  context('#isPublished', function() {
    it('returns true when the session is published', function() {
      // given
      const session = domainBuilder.buildSession({ publishedAt: new Date() });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.true;
    });

    it('returns false when the session is not published', function() {
      // given
      const session = domainBuilder.buildSession({ publishedAt: null });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.false;
    });
  });
});
