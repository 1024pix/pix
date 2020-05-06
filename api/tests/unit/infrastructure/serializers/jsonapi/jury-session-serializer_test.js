const { expect, sinon } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-session-serializer');

describe('Unit | Serializer | JSONAPI | jury-session-serializer', function() {

  describe('#serializeForPaginatedList()', function() {

    it('should call serialize method by destructuring passed parameter', function() {
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

  describe('#serialize()', function() {

    let modelSession;
    let expectedJsonApi;

    beforeEach(() => {
      expectedJsonApi = {
        data: {
          type: 'sessions',
          id: '1',
          attributes: {
            'certification-center-name': 'someCenterName',
            'certification-center-type': 'someCenterType',
            address: 'someAddress',
            room: 'someRoom',
            examiner: 'someExaminer',
            date: '2017-01-20',
            time: '14:30',
            'access-code': 'someAccessCode',
            status: 'someStatus',
            description: 'someDescription',
            'examiner-global-comment': 'someComment',
            'finalized-at': new Date('2020-02-17T14:23:56.000Z'),
            'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56.000Z'),
            'published-at': new Date('2020-02-21T14:23:56.000Z'),
          },
          relationships: {
            certifications: {
              links: {
                related: '/api/jury/sessions/1/certifications',
              }
            },
          }
        }
      };
      modelSession = {
        id: 1,
        certificationCenterName: 'someCenterName',
        certificationCenterType: 'someCenterType',
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
      };
    });

    context('when there is an assigned certification officer', () => {

      it('should convert a Session model object into JSON API data with included officer', function() {
        // given
        const meta = { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 };
        const included = [{
          type: 'user',
          id: '2',
          attributes: {
            'first-name': 'Jean',
            'last-name': 'de la Flûte',
          },
        }];
        const assignedCertificationOfficerRelationship = {
          data: {
            id: '2',
            type: 'user',
          }
        };
        let expectedResult = Object.assign(expectedJsonApi, { meta });
        expectedResult = Object.assign(expectedResult, { included });
        expectedResult.data.relationships = Object.assign(expectedResult.data.relationships,
          { ...expectedResult.data.relationships, 'assigned-certification-officer': assignedCertificationOfficerRelationship });
        modelSession.assignedCertificationOfficer = {
          id: 2,
          firstName: 'Jean',
          lastName: 'de la Flûte',
        };

        // when
        const json = serializer.serialize(modelSession, meta);

        // then
        expect(json).to.deep.equal(expectedResult);
      });
    });

    context('when there is no assigned certification officer', () => {

      it('should convert a Session model object into JSON API data', function() {
        // given
        const meta = { page: 1, pageSize: 10, rowCount: 6, pageCount: 1 };
        const expectedResult = Object.assign(expectedJsonApi, { meta });

        // when
        const json = serializer.serialize(modelSession, meta);

        // then
        expect(json).to.deep.equal(expectedResult);
      });
    });

  });

});
