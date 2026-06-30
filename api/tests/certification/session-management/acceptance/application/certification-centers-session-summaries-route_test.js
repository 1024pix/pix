import { createServer } from '../../../../../server.js';
import { SESSION_STATUSES } from '../../../../../src/certification/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Route | session-summaries', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-centers/{id}/session-summaries', function () {
    it('should return 200 with serialized sessions summaries', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildSession({
        id: 123,
        address: 'ici',
        room: 'labas',
        date: '2021-05-05',
        time: '17:00:00',
        examiner: 'Jeanine',
        finalizedAt: null,
        publishedAt: null,
        certificationCenterId,
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: 123 });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
      await databaseBuilder.commit();
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?page[number]=1&page[size]=10`,
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'session-summaries',
          id: '123',
          attributes: {
            address: 'ici',
            room: 'labas',
            date: '2021-05-05',
            time: '17:00:00',
            examiner: 'Jeanine',
            'enrolled-candidates-count': 1,
            'effective-candidates-count': 0,
            status: 'created',
          },
        },
      ]);
    });

    it('should return 200 with paginated session summaries', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildSession({ certificationCenterId });
      databaseBuilder.factory.buildSession({ certificationCenterId });
      databaseBuilder.factory.buildSession({ certificationCenterId });
      await databaseBuilder.commit();

      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?page[number]=1&page[size]=2`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
      expect(response.result.data[0].type).to.equal('session-summaries');
      expect(response.result.meta.page).to.equal(1);
      expect(response.result.meta.pageSize).to.equal(2);
      expect(response.result.meta.pageCount).to.equal(2);
      expect(response.result.meta.hasSessions).to.be.true;
    });

    it('should return 200 filtered by sessionId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const session = databaseBuilder.factory.buildSession({ certificationCenterId });
      databaseBuilder.factory.buildSession({ certificationCenterId });
      await databaseBuilder.commit();

      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?filter[sessionId]=${session.id}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
      expect(response.result.data[0].id).to.equal(session.id.toString());
    });

    it('should return 200 filtered by status', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildSession({
        certificationCenterId,
        finalizedAt: null,
        publishedAt: null,
      });
      databaseBuilder.factory.buildSession({
        certificationCenterId,
        finalizedAt: new Date('2024-01-01'),
        publishedAt: new Date('2024-01-02'),
      });
      await databaseBuilder.commit();

      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?filter[status]=${SESSION_STATUSES.PROCESSED}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
      expect(response.result.data[0].attributes.status).to.equal('processed');
    });
  });
});
