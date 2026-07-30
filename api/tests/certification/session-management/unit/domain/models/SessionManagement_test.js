import _ from 'lodash';

import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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
  'version',
  'createdBy',
  'firstCertificationStartedAt',
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
      firstCertificationStartedAt: null,
    });
  });

  it('should create an object of the Session type', function () {
    expect(session).to.be.instanceOf(SessionManagement);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
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
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({ publishedAt: new Date() });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.true;
    });

    it('returns false when the session is not published', function () {
      // given
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({ publishedAt: null });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.false;
    });
  });

  context('#isNotAccessible', function () {
    it('returns true when the session is created', function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement.created();
      expect(session.isAccessible()).to.be.true;
    });

    it('returns false when the session is finalized', function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement.finalized();
      expect(session.isAccessible()).to.be.false;
    });

    it('returns false when the session is in process', function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement.inProcess();
      expect(session.isAccessible()).to.be.false;
    });

    it('returns false when the session is processed', function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement.processed();
      expect(session.isAccessible()).to.be.false;
    });
  });

  describe('#get hasExpired', function () {
    it('returns false when session has no started certification', function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
        firstCertificationStartedAt: null,
      });

      expect(session.hasExpired).to.be.false;
    });

    it('returns false when session has a started certification since below 24 hours', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 23);
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
        firstCertificationStartedAt: startDateTime,
      });

      expect(session.hasExpired).to.be.false;
    });

    it('returns true when session has a started certification for more than 24 hours', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 25);
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
        firstCertificationStartedAt: startDateTime,
      });

      expect(session.hasExpired).to.be.true;
    });
  });
});
