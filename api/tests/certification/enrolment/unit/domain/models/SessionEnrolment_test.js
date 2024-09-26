import _ from 'lodash';

import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const SESSION_PROPS = [
  'id',
  'accessCode',
  'address',
  'certificationCenter',
  'certificationCenterType',
  'date',
  'description',
  'examiner',
  'room',
  'time',
  'certificationCandidates',
  'certificationCenterId',
  'invigilatorPassword',
  'version',
  'createdBy',
  'canEnrolCandidate',
];

describe('Unit | Certification | Enrolment | Domain | Models | SessionEnrolment', function () {
  let session;

  beforeEach(function () {
    session = new SessionEnrolment({
      id: 'id',
      accessCode: '',
      address: '',
      certificationCenter: '',
      certificationCenterType: '',
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

  it('should create an object of the SessionEnrolment type', function () {
    expect(session).to.be.instanceOf(SessionEnrolment);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#get isSco', function () {
    it('should return true when session is SCO', function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession({
        certificationCenterType: CERTIFICATION_CENTER_TYPES.SCO,
      });

      // when
      const isSco = session.isSco;

      // then
      expect(isSco).to.be.true;
    });

    it('should return true when session is not SCO', function () {
      // given
      let notScoSessions = Object.values(CERTIFICATION_CENTER_TYPES).map((type) => {
        if (type !== CERTIFICATION_CENTER_TYPES.SCO)
          return domainBuilder.certification.enrolment.buildSession({
            certificationCenterType: type,
          });
        return null;
      });
      notScoSessions = _.compact(notScoSessions);

      // when
      for (const notScoSession of notScoSessions) {
        const isSco = notScoSession.isSco;
        expect(isSco, `Session of type ${notScoSession.certificationCenterType} should return isSco as false`).to.be
          .false;
      }
    });
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

  context('#generateInvigilatorPassword', function () {
    it('should return a invigilator password containing 6 characters', async function () {
      // given
      // when
      const sessionEnrolment = new SessionEnrolment();

      // then
      expect(sessionEnrolment.invigilatorPassword).to.have.lengthOf(6);
    });

    it('should return a invigilator password containing only allowed characters', async function () {
      // given
      // when
      const randomPasswords = _.times(100, () => {
        const aSession = new SessionEnrolment();
        return aSession.invigilatorPassword;
      });

      // then
      randomPasswords.forEach((password) => {
        expect(password).to.match(/^[bcdfghjkmpqrstvwxyBCDFGHJKMPQRSTVWXY2-9!*?]+$/);
      });
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

  context('#isCandidateAlreadyEnrolled', function () {
    it('should return true when all personal info matches (case / diacritics insensitive) with an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'un prénom très proche de frederic',
          lastName: `un nom tres proche de debussy`,
          birthdate: '1990-01-04',
        }),
      ];
      const normalizeStringFnc = sinon.stub();
      normalizeStringFnc.withArgs(candidatePersonalInfo.lastName).returns(candidatePersonalInfo.lastName);
      normalizeStringFnc.withArgs(candidatePersonalInfo.firstName).returns(candidatePersonalInfo.firstName);
      normalizeStringFnc.withArgs(candidates[0].lastName).returns(candidates[0].lastName);
      normalizeStringFnc.withArgs(candidates[0].firstName).returns(candidates[0].firstName);
      normalizeStringFnc.withArgs(candidates[1].lastName).returns(candidatePersonalInfo.lastName);
      normalizeStringFnc.withArgs(candidates[1].firstName).returns(candidatePersonalInfo.firstName);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.true;
    });

    it('should return false when first name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Richard',
          lastName: candidatePersonalInfo.lastName,
          birthdate: candidatePersonalInfo.birthdate,
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });

    it('should return false when last name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: candidatePersonalInfo.firstName,
          lastName: 'Chopin',
          birthdate: candidatePersonalInfo.birthdate,
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });

    it('should return false when birthdate is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: candidatePersonalInfo.firstName,
          lastName: candidatePersonalInfo.lastName,
          birthdate: '1990-01-05',
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });
  });

  context('#hasReconciledCandidate', function () {
    it('should return true when at least one candidate is linked', function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 123,
          reconciledAt: new Date('2024-09-25'),
        }),
      ];

      // when
      const hasReconciledCandidate = session.hasReconciledCandidate({
        candidates,
      });

      // then
      expect(hasReconciledCandidate).to.be.true;
    });

    it('should return false when no candidate is linked', function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
      ];

      // when
      const hasReconciledCandidate = session.hasReconciledCandidate({
        candidates,
      });

      // then
      expect(hasReconciledCandidate).to.be.false;
    });
  });

  context('#hasReconciledCandidateTo', function () {
    it('should return true when at least one candidate is reconciled to given user', function () {
      // given
      const userId = 123;
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 123,
          reconciledAt: new Date('2024-09-25'),
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 456,
          reconciledAt: new Date('2024-09-25'),
        }),
      ];

      // when
      const hasReconciledCandidateTo = session.hasReconciledCandidateTo({
        candidates,
        userId,
      });

      // then
      expect(hasReconciledCandidateTo).to.be.true;
    });

    it('should return false when no candidate is reconciled to user', function () {
      // given
      const userId = 123;
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 456,
        }),
      ];

      // when
      const hasReconciledCandidateTo = session.hasReconciledCandidateTo({
        candidates,
        userId,
      });

      // then
      expect(hasReconciledCandidateTo).to.be.false;
    });
  });

  context('#updateInfo', function () {
    it('should update the allowed info on session', function () {
      // given
      const originalInfo = {
        id: 123,
        accessCode: 'ORIGINAL_ACCESS_CODE',
        address: 'ORIGINAL_ADDRESS',
        certificationCenter: 'ORIGINAL_CERTIF_CENTER',
        certificationCenterId: 456,
        date: '2021-01-01',
        description: 'ORIGINAL_DESCRIPTION',
        examiner: 'ORIGINAL_EXAMINER',
        room: 'ORIGINAL_ROOM',
        time: '12:00',
        examinerGlobalComment: 'ORIGINAL_EXAM_COMMENT',
        hasIncident: false,
        hasJoiningIssue: false,
        finalizedAt: new Date('2021-01-01'),
        resultsSentToPrescriberAt: new Date('2021-01-01'),
        publishedAt: new Date('2021-01-01'),
        assignedCertificationOfficerId: 789,
        invigilatorPassword: 'ORIGINAL_PASSWORD',
        certificationCandidates: [],
        version: 2,
        createdBy: new Date('2021-01-01'),
      };
      const session = domainBuilder.certification.enrolment.buildSession(originalInfo);
      const newInfo = {
        address: 'NEW_ADDRESS',
        room: 'NEW_ROOM',
        accessCode: 'NEW_ACCESSCODE',
        examiner: 'NEW_EXAMINER',
        date: '2023-12-25',
        time: '23:00',
        description: 'NEW_DESCRIPTION',
      };

      // when
      session.updateInfo(newInfo);

      // then
      expect(session).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildSession({
          ...originalInfo,
          ...newInfo,
        }),
      );
    });
  });

  context('#findCandidatesByPersonalInfo', function () {
    it('should return the candidate on which all personal info matches (case / diacritics insensitive)', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          id: 123,
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          id: 456,
          firstName: 'un prénom très proche de frederic',
          lastName: `un nom tres proche de debussy`,
          birthdate: '1990-01-04',
        }),
      ];
      const normalizeStringFnc = sinon.stub();
      normalizeStringFnc.withArgs(candidatePersonalInfo.lastName).returns(candidatePersonalInfo.lastName);
      normalizeStringFnc.withArgs(candidatePersonalInfo.firstName).returns(candidatePersonalInfo.firstName);
      normalizeStringFnc.withArgs(candidates[0].lastName).returns(candidates[0].lastName);
      normalizeStringFnc.withArgs(candidates[0].firstName).returns(candidates[0].firstName);
      normalizeStringFnc.withArgs(candidates[1].lastName).returns(candidatePersonalInfo.lastName);
      normalizeStringFnc.withArgs(candidates[1].firstName).returns(candidatePersonalInfo.firstName);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates.map(({ id }) => id)).to.deep.equal([456]);
    });

    it('should return null when first name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Richard',
          lastName: candidatePersonalInfo.lastName,
          birthdate: candidatePersonalInfo.birthdate,
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return false when last name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: candidatePersonalInfo.firstName,
          lastName: 'Chopin',
          birthdate: candidatePersonalInfo.birthdate,
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return false when birthdate is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Un',
          lastName: 'Related',
          birthdate: '1995-04-04',
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: candidatePersonalInfo.firstName,
          lastName: candidatePersonalInfo.lastName,
          birthdate: '1990-01-05',
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return all candidates matching personal info', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const session = domainBuilder.certification.enrolment.buildSession();
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          id: 123,
          firstName: candidatePersonalInfo.firstName,
          lastName: candidatePersonalInfo.lastName,
          birthdate: candidatePersonalInfo.birthdate,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          id: 456,
          firstName: candidatePersonalInfo.firstName,
          lastName: candidatePersonalInfo.lastName,
          birthdate: candidatePersonalInfo.birthdate,
        }),
      ];
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidates,
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates.map(({ id }) => id)).to.deep.equal([123, 456]);
    });
  });
});
