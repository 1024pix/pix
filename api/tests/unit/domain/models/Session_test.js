const Session = require('../../../../lib/domain/models/Session');
const { expect } = require('../../../test-helper');
const _ = require('lodash');

const SESSION_PROPS = [
  'id',
  'accessCode',
  'address',
  'certificationCenter',
  'certificationCenterId',
  'date',
  'description',
  'examiner',
  'room',
  'time',
  'status',
  'examinerGlobalComment',
  'finalizedAt',
  'resultsSentToPrescriberAt',
  'certificationCandidates',
];

describe('Unit | Domain | Models | Session', () => {
  let session;

  beforeEach(() => {
    session = new Session({
      id: 'id',
      accessCode: '',
      address: '',
      certificationCenter: '',
      certificationCenterId: '',
      date: '',
      description: '',
      examiner: '',
      room: '',
      time: '',
      status: '',
      examinerGlobalComment: '',
      finalizedAt: '',
      resultsSentToPrescriberAt: '',
      // includes
      certificationCandidates: [],
    });
  });

  it('should create an object of the Session type', () => {
    expect(session).to.be.instanceOf(Session);
  });

  it('should create a session with all the requires properties', () => {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#areResultsFlaggedAsSent', () => {
    context('when session resultsSentToPrescriberAt timestamp is defined', () => {

      it('should return true', () => {
        // given
        session.resultsSentToPrescriberAt = new Date();

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.true;
      });
    });
    context('when session resultsSentToPrescriberAt timestamp is falsy', () => {

      it('should return false', () => {
        // given
        session.resultsSentToPrescriberAt = null;

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.false;
      });
    });
  });
});
