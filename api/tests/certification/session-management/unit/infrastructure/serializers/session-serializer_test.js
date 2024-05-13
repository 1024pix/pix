import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';
import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/session-serializer.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { EMPTY_BLANK_AND_NULL, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | session-management | Serializer | session-serializer', function () {
  describe('#serialize()', function () {
    let session;
    let expectedJsonApi;

    beforeEach(function () {
      expectedJsonApi = {
        data: {
          type: 'session-managements',
          id: '12',
          attributes: {
            status: SESSION_STATUSES.PROCESSED,
            'examiner-global-comment': 'It was a fine session my dear',
            'has-incident': true,
            'has-joining-issue': true,
            'finalized-at': new Date('2020-02-17T14:23:56Z'),
            'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
            'published-at': new Date('2020-02-21T14:23:56Z'),
          },
          relationships: {
            'certification-reports': {
              links: {
                related: '/api/sessions/12/certification-reports',
              },
            },
          },
        },
      };
      session = new SessionManagement({
        id: 12,
        examinerGlobalComment: 'It was a fine session my dear',
        hasIncident: true,
        hasJoiningIssue: true,
        finalizedAt: new Date('2020-02-17T14:23:56Z'),
        resultsSentToPrescriberAt: new Date('2020-02-20T14:23:56Z'),
        publishedAt: new Date('2020-02-21T14:23:56Z'),
      });
    });

    context('when session does not have a link to an existing certification center', function () {
      it('should convert a SessionManagement model object into JSON API data including supervisor password', function () {
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
        type: 'session-managements',
        id: '12',
        attributes: {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          status: SESSION_STATUSES.CREATED,
          description: '',
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
      expect(session).to.be.instanceOf(SessionManagement);
      expect(session.id).to.equal('12');
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
        expect(result.examinerGlobalComment).to.deep.equal(SessionManagement.NO_EXAMINER_GLOBAL_COMMENT);
      });
    });
  });
});
