import _ from 'lodash';

import { Session } from '../../../../../../src/certification/enrolment/domain/models/Session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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
  'certificationCandidates',
  'certificationCenterId',
  'supervisorPassword',
  'version',
  'createdBy',
  'canEnrolCandidate',
];

describe('Unit | Certification | Enrolment | Domain | Models | Session', function () {
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
      // includes
      certificationCandidates: [],
      // references
      certificationCenterId: '',
      createdBy: '',
      finalizedAt: null,
    });
  });

  it('should create an object of the Session type', function () {
    expect(session).to.be.instanceOf(Session);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#canEnrolCandidate', function () {
    it('should return true when session is not finalized', function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession.created();

      // when
      const result = session.canEnrolCandidate;

      // then
      expect(result).to.be.true;
    });

    it('should return false when session is not finalized', function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession.finalized();

      // when
      const result = session.canEnrolCandidate;

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
        const session = domainBuilder.certification.enrolment.buildSession({ date: '2022-01-01' });

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.true;
      });
    });

    context('when session is not scheduled in the past', function () {
      it('should return false', async function () {
        // given
        const session = domainBuilder.certification.enrolment.buildSession({ date: '2024-01-01' });

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.false;
      });
    });
  });
});
