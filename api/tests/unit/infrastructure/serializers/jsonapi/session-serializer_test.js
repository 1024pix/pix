const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/session-serializer');

const Session = require('../../../../../lib/domain/models/Session');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | session-serializer', function() {

  const modelSession = new Session({
    id: 12,
    certificationCenter: 'Université de dressage de loutres',
    address: 'Nice',
    room: '28D',
    examiner: 'Antoine Toutvenant',
    date: '2017-01-20',
    time: '14:30',
    description: '',
    accessCode: '',
    status: 'created',
  });

  let jsonApiSession;

  beforeEach(function() {
    jsonApiSession = {
      data: {
        type: 'sessions',
        id: '12',
        attributes: {
          'certification-center': 'Université de dressage de loutres',
          address: 'Nice',
          room: '28D',
          'access-code': '',
          examiner: 'Antoine Toutvenant',
          date: '2017-01-20',
          time: '14:30',
          status: 'created',
          description: ''
        },
        relationships: {
          certifications: {
            data: null
          },
          'certification-candidates': {
            'links': {
              'related': '/api/sessions/12/certification-candidates',
            }
          },
        }
      }
    };
  });

  describe('#serialize()', function() {

    it('should convert a Session model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelSession);

      // then
      expect(json).to.deep.equal(jsonApiSession);
    });

    it('should convert certifications relationships into JSON API relationships', () => {
      // given
      const certification1 = CertificationCourse.fromAttributes({ id: 1 });
      const certification2 = CertificationCourse.fromAttributes({ id: 2 });
      const associatedCertifications = [certification1, certification2];
      const session = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres',
        certificationCenterId: 42,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-01-20',
        time: '14:30',
        description: '',
        accessCode: '',
        status: 'created',
        certifications: associatedCertifications
      });

      // when
      const JSONAPISession = serializer.serialize(session);

      // then
      return expect(JSONAPISession).to.deep.equal({
        data: {
          id: '12',
          type: 'sessions',
          attributes: {
            'certification-center': 'Université de dressage de loutres',
            address: 'Nice',
            room: '28D',
            'access-code': '',
            examiner: 'Antoine Toutvenant',
            date: '2017-01-20',
            time: '14:30',
            description: '',
            status: 'created',
          },
          relationships: {
            certifications: {
              data: [
                { type: 'certifications', id: '1' },
                { type: 'certifications', id: '2' }
              ]
            },
            'certification-candidates': {
              'links': {
                'related': '/api/sessions/12/certification-candidates',
              }
            },
          }
        }
      });

    });

  });

  describe('#deserialize()', function() {

    beforeEach(() => {
      jsonApiSession.data.relationships['certification-center'] = {
        data: {
          id: 42
        }
      };

      jsonApiSession.data.attributes.date = '2017-01-20';
    });

    it('should convert JSON API data to a Session', function() {
      // when
      const session = serializer.deserialize(jsonApiSession);

      // then
      expect(session).to.be.instanceOf(Session);
      expect(session.id).to.equal('12');
      expect(session.certificationCenter).to.equal('Université de dressage de loutres');
      expect(session.certificationCenterId).to.equal(42);
      expect(session.address).to.equal('Nice');
      expect(session.room).to.equal('28D');
      expect(session.examiner).to.equal('Antoine Toutvenant');
      expect(session.date).to.equal('2017-01-20');
      expect(session.time).to.equal('14:30');
      expect(session.description).to.equal('');
    });

    context('when there is no certification center ID', () => {

      beforeEach(() => {
        jsonApiSession.data.relationships = undefined;
      });

      it('should set null for session.certificationCenterId (without loosing certification center name)', () => {
        // when
        const session = serializer.deserialize(jsonApiSession);

        // then
        expect(session.certificationCenter).to.equal('Université de dressage de loutres');
        expect(session.certificationCenterId).to.be.null;
      });
    });
  });

});
