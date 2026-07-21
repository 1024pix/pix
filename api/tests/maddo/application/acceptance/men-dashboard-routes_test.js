import { createMaddoServer } from '../../../../server.maddo.js';
import { expect } from '../../../test-helper.js';
import { datamartBuilder } from '../../../tooling/databases.js';
import { generateValidRequestAuthorizationHeaderForApplication } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Maddo | Route | Men | Dashboard', function () {
  let server;

  beforeEach(async function () {
    server = await createMaddoServer();
  });

  describe('GET /api/men/dashboard/certifications', function () {
    it('returns certification dataset with pagination and HTTP 200', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI001',
        competenceCode: '1.1',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/men/dashboard/certifications',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            'client-id',
            'pix-client',
            'men-dashboard',
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.dataset).to.have.length(1);
      expect(response.result.dataset[0].schoolUai).to.equal('UAI001');
      expect(response.result.dataset[0].competenceCode).to.equal('1.1');
      expect(response.result.page).to.deep.equal({
        number: 1,
        size: 10,
        count: 1,
      });
    });

    it('paginates results when page params are provided', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_A',
      });
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_B',
      });
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_C',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/men/dashboard/certifications?page[number]=2&page[size]=2',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            'client-id',
            'pix-client',
            'men-dashboard',
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.dataset).to.have.length(1);
      expect(response.result.dataset[0].schoolUai).to.equal('UAI_C');
      expect(response.result.page).to.deep.equal({
        number: 2,
        size: 2,
        count: 2,
      });
    });

    it('returns HTTP 401 when no authorization header is provided', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/men/dashboard/certifications',
      });

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('returns HTTP 403 when the token does not have the men-dashboard scope', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/men/dashboard/certifications',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication('client-id', 'pix-client', 'campaigns'),
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/men/dashboard/participations', function () {
    it('returns participation dataset with pagination and HTTP 200', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI001',
        competenceCode: '1.1',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/men/dashboard/participations',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            'client-id',
            'pix-client',
            'men-dashboard',
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.dataset).to.have.length(1);
      expect(response.result.dataset[0].schoolUai).to.equal('UAI001');
      expect(response.result.dataset[0].competenceCode).to.equal('1.1');
      expect(response.result.page).to.deep.equal({
        number: 1,
        size: 10,
        count: 1,
      });
    });

    it('paginates results when page params are provided', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_A',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_B',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_C',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/men/dashboard/participations?page[number]=2&page[size]=2',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            'client-id',
            'pix-client',
            'men-dashboard',
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.dataset).to.have.length(1);
      expect(response.result.dataset[0].schoolUai).to.equal('UAI_C');
      expect(response.result.page).to.deep.equal({
        number: 2,
        size: 2,
        count: 2,
      });
    });

    it('returns HTTP 401 when no authorization header is provided', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/men/dashboard/participations',
      });

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('returns HTTP 403 when the token does not have the men-dashboard scope', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/men/dashboard/participations',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication('client-id', 'pix-client', 'campaigns'),
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
