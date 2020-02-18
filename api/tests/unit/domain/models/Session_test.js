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
});
