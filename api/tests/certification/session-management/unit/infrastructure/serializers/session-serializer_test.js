import { expect } from 'chai';

import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';
import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/session-serializer.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';

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
            'has-expired': false,
            'finalized-at': new Date('2020-02-17T14:23:56Z'),
            'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
            'published-at': new Date('2020-02-21T14:23:56Z'),
            version: 3,
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
        version: 3,
      });
    });

    context('#serialize()', function () {
      it('should return expected json', function () {
        // when
        const json = serializer.serialize({ session });

        // then
        expect(json).to.deep.equal(expectedJsonApi);
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
});
