const { expect, EMPTY_BLANK_AND_NULL } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/session-serializer');

const Session = require('../../../../../lib/domain/models/Session');
const { statuses } = require('../../../../../lib/domain/models/Session');

describe('Unit | Serializer | JSONAPI | session-serializer', function() {

  describe('#serialize()', function() {
    let modelSession;
    let expectedJsonApi;

    beforeEach(() => {
      expectedJsonApi = {
        data: {
          type: 'sessions',
          id: '12',
          attributes: {
            'certification-center-name': 'Université des Laura en folie',
            address: 'Nice',
            room: '28D',
            'access-code': '',
            examiner: 'Antoine Toutvenant',
            date: '2017-01-20',
            time: '14:30',
            status: statuses.PROCESSED,
            description: '',
            'examiner-global-comment': 'It was a fine session my dear',
            'finalized-at': new Date('2020-02-17T14:23:56Z'),
            'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
            'published-at': new Date('2020-02-21T14:23:56Z'),
          },
          relationships: {
            'certification-candidates': {
              links: {
                related: '/api/sessions/12/certification-candidates',
              }
            },
            'certification-reports': {
              'links': {
                'related': '/api/sessions/12/certification-reports',
              }
            },
          }
        }
      };
      modelSession = new Session({
        id: 12,
        certificationCenter: 'Université des Laura en folie',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-01-20',
        time: '14:30',
        description: '',
        accessCode: '',
        examinerGlobalComment: 'It was a fine session my dear',
        finalizedAt: new Date('2020-02-17T14:23:56Z'),
        resultsSentToPrescriberAt: new Date('2020-02-20T14:23:56Z'),
        publishedAt: new Date('2020-02-21T14:23:56Z'),
      });
    });

    context('when session does not have a link to an existing certification center', () => {

      it('should convert a Session model object into JSON API data', function() {
        // when
        const json = serializer.serialize(modelSession);

        // then
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });

    context('when session has a link to an existing certification center', () => {

      it('should convert a Session model object into JSON API data with a link to the certification center', function() {
        // given
        modelSession.certificationCenterId = 13;

        // when
        const json = serializer.serialize(modelSession);

        // then
        expectedJsonApi.data.relationships['certification-center'] = {
          'links': {
            'related': '/api/certification-centers/13',
          }
        };
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });

  });

  describe('#deserialize()', function() {
    const jsonApiSession = {
      data: {
        type: 'sessions',
        id: '12',
        attributes: {
          address: 'Nice',
          room: '28D',
          'access-code': '',
          examiner: 'Antoine Toutvenant',
          date: '2017-01-20',
          time: '14:30',
          status: statuses.CREATED,
          description: '',
          'examiner-global-comment': 'It was a fine session my dear',
          'finalized-at': new Date('2020-02-17T14:23:56Z'),
          'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
        },
        relationships: {
          certifications: {
            links: {
              related: '/api/sessions/12/certifications',
            }
          },
          'certification-candidates': {
            links: {
              related: '/api/sessions/12/certification-candidates',
            }
          },
          'certification-reports': {
            'links': {
              'related': '/api/sessions/12/certification-reports',
            }
          },
        }
      }
    };

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
      expect(session.certificationCenterId).to.equal(42);
      expect(session.address).to.equal('Nice');
      expect(session.room).to.equal('28D');
      expect(session.examiner).to.equal('Antoine Toutvenant');
      expect(session.date).to.equal('2017-01-20');
      expect(session.time).to.equal('14:30');
      expect(session.description).to.equal('');
      expect(session.examinerGlobalComment).to.equal('It was a fine session my dear');
    });

    EMPTY_BLANK_AND_NULL.forEach((examinerGlobalComment) => {
      it(`should return no examiner comment if comment is "${examinerGlobalComment}"`, () => {
        // given
        jsonApiSession.data.attributes['examiner-global-comment'] = examinerGlobalComment;

        // when
        const result = serializer.deserialize(jsonApiSession);

        // then
        expect(result.examinerGlobalComment).to.deep.equal(Session.NO_EXAMINER_GLOBAL_COMMENT);
      });
    });
  });

  describe('#serializeForFinalization()', () => {

    let modelSession;
    const expectedJsonApi = {
      data: {
        type: 'sessions',
        id: '12',
        attributes: {
          status: statuses.CREATED,
          'examiner-global-comment': 'It was a fine session my dear',
        },
      }
    };

    beforeEach(function() {
      modelSession = new Session({
        id: 12,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-01-20',
        time: '14:30',
        description: '',
        accessCode: '',
        status: statuses.CREATED,
        examinerGlobalComment: 'It was a fine session my dear',
      });

    });

    it('should convert a Session model object into JSON API data', function() {
      // when
      const json = serializer.serializeForFinalization(modelSession);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });

  });

});
