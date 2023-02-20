import { expect, EMPTY_BLANK_AND_NULL } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/session-serializer';
import Session from '../../../../../lib/domain/models/Session';
import { statuses } from '../../../../../lib/domain/models/Session';

describe('Unit | Serializer | JSONAPI | session-serializer', function () {
  describe('#serialize()', function () {
    let session;
    let expectedJsonApi;

    beforeEach(function () {
      expectedJsonApi = {
        data: {
          type: 'sessions',
          id: '12',
          attributes: {
            'certification-center-id': 123,
            address: 'Nice',
            room: '28D',
            'access-code': '',
            examiner: 'Antoine Toutvenant',
            date: '2017-01-20',
            time: '14:30',
            status: statuses.PROCESSED,
            description: '',
            'examiner-global-comment': 'It was a fine session my dear',
            'has-incident': true,
            'has-joining-issue': true,
            'finalized-at': new Date('2020-02-17T14:23:56Z'),
            'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
            'published-at': new Date('2020-02-21T14:23:56Z'),
            'supervisor-password': 'SOWHAT',
          },
          relationships: {
            'certification-candidates': {
              links: {
                related: '/api/sessions/12/certification-candidates',
              },
            },
            'certification-reports': {
              links: {
                related: '/api/sessions/12/certification-reports',
              },
            },
          },
        },
      };
      session = new Session({
        id: 12,
        certificationCenterId: 123,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-01-20',
        time: '14:30',
        description: '',
        accessCode: '',
        supervisorPassword: 'SOWHAT',
        examinerGlobalComment: 'It was a fine session my dear',
        hasIncident: true,
        hasJoiningIssue: true,
        finalizedAt: new Date('2020-02-17T14:23:56Z'),
        resultsSentToPrescriberAt: new Date('2020-02-20T14:23:56Z'),
        publishedAt: new Date('2020-02-21T14:23:56Z'),
      });
    });

    context('when session does not have a link to an existing certification center', function () {
      it('should convert a Session model object into JSON API data including supervisor password', function () {
        // when
        const json = serializer.serialize({ session });

        // then
        expect(json).to.deep.equal(expectedJsonApi);
      });
    });

    context('when hasSupervisorAccess is provided', function () {
      it('should add hasSupervisorAccess to the serialized session', function () {
        // given
        const expectedJsonApiIncludingHasSupervisorAccess = {
          ...expectedJsonApi,
        };
        expectedJsonApiIncludingHasSupervisorAccess.data.attributes['has-supervisor-access'] = true;

        // when
        const json = serializer.serialize({ session, hasSupervisorAccess: true });

        // then
        expect(json).to.deep.equal(expectedJsonApiIncludingHasSupervisorAccess);
      });
    });

    context('when hasSomeCleaAcquired is provided', function () {
      it('should add hasSomeCleaAcquired to the serialized session', function () {
        // given
        const expectedJsonApiIncludingHasSomeCleaAcquired = {
          ...expectedJsonApi,
        };
        expectedJsonApiIncludingHasSomeCleaAcquired.data.attributes['has-some-clea-acquired'] = true;

        // when
        const json = serializer.serialize({ session, hasSomeCleaAcquired: true });

        // then
        expect(json).to.deep.equal(expectedJsonApiIncludingHasSomeCleaAcquired);
      });
    });
  });

  describe('#deserialize()', function () {
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          status: statuses.CREATED,
          description: '',
          'certification-center-id': 42,
          'examiner-global-comment': 'It was a fine session my dear',
          'has-incident': true,
          'has-joining-issue': true,
          'finalized-at': new Date('2020-02-17T14:23:56Z'),
          'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
        },
        relationships: {
          certifications: {
            links: {
              related: '/api/sessions/12/certifications',
            },
          },
          'certification-candidates': {
            links: {
              related: '/api/sessions/12/certification-candidates',
            },
          },
          'certification-reports': {
            links: {
              related: '/api/sessions/12/certification-reports',
            },
          },
        },
      },
    };

    beforeEach(function () {
      jsonApiSession.data.attributes.date = '2017-01-20';
    });

    it('should convert JSON API data to a Session', function () {
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
      expect(session.hasIncident).to.be.true;
      expect(session.hasJoiningIssue).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    EMPTY_BLANK_AND_NULL.forEach((examinerGlobalComment) => {
      it(`should return no examiner comment if comment is "${examinerGlobalComment}"`, function () {
        // given
        jsonApiSession.data.attributes['examiner-global-comment'] = examinerGlobalComment;

        // when
        const result = serializer.deserialize(jsonApiSession);

        // then
        expect(result.examinerGlobalComment).to.deep.equal(Session.NO_EXAMINER_GLOBAL_COMMENT);
      });
    });
  });
});
