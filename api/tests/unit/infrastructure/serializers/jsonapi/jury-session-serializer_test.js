const { expect, sinon } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-session-serializer');

describe('Unit | Serializer | JSONAPI | jury-session-serializer', function () {
  describe('#serializeForPaginatedList()', function () {
    it('should call serialize method by destructuring passed parameter', function () {
      // given
      const restore = serializer.serialize;
      serializer.serialize = sinon.stub();
      const jurySessions = Symbol('someJurySessions');
      const pagination = Symbol('somePagination');
      const parameter = { jurySessions, pagination, someUnusedField: 'unused' };

      // when
      serializer.serializeForPaginatedList(parameter);

      // then
      expect(serializer.serialize).to.have.been.calledWithExactly(jurySessions, pagination);
      serializer.serialize = restore;
    });
  });

  describe('#serialize()', function () {
    let modelSession;

    beforeEach(function () {
      modelSession = {
        id: 1,
        certificationCenterName: 'someCenterName',
        certificationCenterType: 'someCenterType',
        certificationCenterId: 'someCenterId',
        certificationCenterExternalId: 'someCenterExternalId',
        address: 'someAddress',
        room: 'someRoom',
        examiner: 'someExaminer',
        date: '2017-01-20',
        time: '14:30',
        accessCode: 'someAccessCode',
        status: 'someStatus',
        description: 'someDescription',
        examinerGlobalComment: 'someComment',
        finalizedAt: new Date('2020-02-17T14:23:56Z'),
        resultsSentToPrescriberAt: new Date('2020-02-20T14:23:56Z'),
        publishedAt: new Date('2020-02-21T14:23:56Z'),
        juryComment: 'Si on n’avait pas perdu une heure et quart, on serait là depuis une heure et quart.',
        juryCommentedAt: new Date('2021-02-21T14:23:56Z'),
      };
    });

    context('when there is an assigned certification officer', function () {
      it('should convert a Session model object into JSON API data with included officer', function () {
        // given
        const expectedResult = _buildExpectedJsonAPI(
          [
            {
              type: 'user',
              id: '2',
              attributes: { 'first-name': 'Jean', 'last-name': 'de la Flûte' },
            },
          ],
          {
            'assigned-certification-officer': {
              data: { id: '2', type: 'user' },
            },
          }
        );
        modelSession.assignedCertificationOfficer = {
          id: 2,
          firstName: 'Jean',
          lastName: 'de la Flûte',
        };

        // when
        const json = serializer.serialize(modelSession, { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 });

        // then
        expect(json).to.deep.equal(expectedResult);
      });
    });

    context('when there is a jury comment', function () {
      it('should convert a Session model object into JSON API data with included comment', function () {
        // given
        const expectedResult = _buildExpectedJsonAPI(
          [
            {
              type: 'user',
              id: '3',
              attributes: { 'first-name': 'Phil', 'last-name': 'Hippo' },
            },
          ],
          {
            'jury-comment-author': {
              data: { id: '3', type: 'user' },
            },
          }
        );

        modelSession.juryCommentAuthor = {
          id: 3,
          firstName: 'Phil',
          lastName: 'Hippo',
        };

        // when
        const json = serializer.serialize(modelSession, { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 });

        // then
        expect(json).to.deep.equal(expectedResult);
      });
    });

    context('when there is neither assigned certification officer nor jury comment', function () {
      it('should convert a Session model object into JSON API data', function () {
        // given
        const expectedResult = _buildExpectedJsonAPI();

        // when
        const json = serializer.serialize(modelSession, { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 });

        // then
        expect(json).to.deep.equal(expectedResult);
      });
    });
  });
});

function _buildExpectedJsonAPI(included, relationships = {}) {
  const expectedJsonAPI = {
    data: {
      type: 'sessions',
      id: '1',
      attributes: {
        'certification-center-name': 'someCenterName',
        'certification-center-type': 'someCenterType',
        'certification-center-id': 'someCenterId',
        'certification-center-external-id': 'someCenterExternalId',
        address: 'someAddress',
        room: 'someRoom',
        examiner: 'someExaminer',
        date: '2017-01-20',
        time: '14:30',
        'access-code': 'someAccessCode',
        status: 'someStatus',
        description: 'someDescription',
        'examiner-global-comment': 'someComment',
        'finalized-at': new Date('2020-02-17T14:23:56Z'),
        'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
        'published-at': new Date('2020-02-21T14:23:56Z'),
        'jury-comment': 'Si on n’avait pas perdu une heure et quart, on serait là depuis une heure et quart.',
        'jury-commented-at': new Date('2021-02-21T14:23:56Z'),
      },
      relationships: {
        ...relationships,
        'jury-certification-summaries': {
          links: {
            related: '/api/admin/sessions/1/jury-certification-summaries',
          },
        },
      },
    },
    meta: { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 },
  };

  if (included) {
    expectedJsonAPI.included = included;
  }

  return expectedJsonAPI;
}
