const { expect, domainBuilder } = require('../../../../test-helper');
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
          description: ''
        },
        relationships: {
          certifications: {
            data: null
          },
          'certification-candidates': {
            data: null
          }
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
      const certificationCandidate1 = domainBuilder.buildCertificationCandidate({ id: 1 });
      const certificationCandidate2 = domainBuilder.buildCertificationCandidate({ id: 2 });
      const associatedCertifications = [certification1, certification2];
      const associatedCertificationCandidates = [certificationCandidate1, certificationCandidate2];
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
        certifications: associatedCertifications,
        certificationCandidates: associatedCertificationCandidates,
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
            description: ''
          },
          relationships: {
            certifications: {
              data: [
                { type: 'certifications', id: '1' },
                { type: 'certifications', id: '2' }
              ]
            },
            'certification-candidates': {
              data: [
                { type: 'certificationCandidates', id: '1' },
                { type: 'certificationCandidates', id: '2' }
              ]
            }
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

      // FIXME deserializer expects date in localized format!
      jsonApiSession.data.attributes.date = '20/01/2017';
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
