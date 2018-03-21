const { expect, sinon } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/session-serializer');

const Session = require('../../../../../lib/domain/models/Session');
const sessionCodeService = require('../../../../../lib/domain/services/session-code-service');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');

describe('Unit | Serializer | JSONAPI | session-serializer', function() {

  const modelSession = new Session({
    id: 12,
    certificationCenter: 'Université de dressage de loutres',
    address: 'Nice',
    room: '28D',
    examiner: 'Antoine Toutvenant',
    date: '20/01/2017',
    time: '14:30',
    description: '',
    accessCode: '',
  });

  const jsonSession = {
    data: {
      type: 'sessions',
      id: 12,
      attributes: {
        'certification-center': 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        'access-code': '',
        examiner: 'Antoine Toutvenant',
        date: '20/01/2017',
        time: '14:30',
        description: ''
      }
    }
  };

  describe('#serialize()', function() {

    it('should convert a Session model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelSession);

      // then
      expect(json).to.deep.equal(jsonSession);
    });

  });

  describe('#deserialize()', function() {
    beforeEach(() => sinon.stub(sessionCodeService, 'getNewSessionCode').resolves('ABCD12'));

    afterEach(() => sessionCodeService.getNewSessionCode.restore());

    it('should convert JSON API data to a Session', function() {
      // when
      const promise = serializer.deserialize(jsonSession);

      // then
      return promise.then((session) => {
        expect(session).to.be.instanceOf(Session);
      });

    });

    it('should have attributes', function() {
      // when
      const promise = serializer.deserialize(jsonSession);

      // then
      return promise.then((session) => {
        expect(session.id).to.equal(12);
        expect(session.certificationCenter).to.equal('Université de dressage de loutres');
        expect(session.address).to.equal('Nice');
        expect(session.room).to.equal('28D');
        expect(session.examiner).to.equal('Antoine Toutvenant');
        expect(session.date).to.equal('2017-01-20');
        expect(session.time).to.equal('14:30');
        expect(session.description).to.equal('');
        expect(session.accessCode).to.equal('ABCD12');
      });
    });

    it('should return an error if date is in wrong format', function() {
      // given
      jsonSession.data.attributes.date = '12/14/2015';

      // then
      expect(() => serializer.deserialize(jsonSession)).to.throw(WrongDateFormatError);
    });

  });

});
