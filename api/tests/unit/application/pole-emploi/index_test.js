import {
  expect,
  HttpTestServer,
  sinon,
  generateValidRequestAuthorizationHeaderForApplication,
} from '../../../test-helper';

import poleEmploiController from '../../../../lib/application/pole-emploi/pole-emploi-controller';
import moduleUnderTest from '../../../../lib/application/pole-emploi';

describe('Unit | Router | pole-emploi-router', function () {
  describe('GET /api/pole-emploi/envois', function () {
    it('should return 200 if the user is a pole emploi user', async function () {
      sinon.stub(poleEmploiController, 'getSendings').callsFake((_request, h) => h.response('ok').code(200));

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      const POLE_EMPLOI_CLIENT_ID = 'poleEmploiClientId';
      const POLE_EMPLOI_SCOPE = 'pole-emploi-participants-result';
      const POLE_EMPLOI_SOURCE = 'poleEmploi';

      const method = 'GET';
      const url = '/api/pole-emploi/envois';
      const headers = {
        authorization: generateValidRequestAuthorizationHeaderForApplication(
          POLE_EMPLOI_CLIENT_ID,
          POLE_EMPLOI_SOURCE,
          POLE_EMPLOI_SCOPE
        ),
      };
      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 401 if the user is a pole emploi user', async function () {
      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/pole-emploi/envois';
      const headers = { authorization: generateValidRequestAuthorizationHeaderForApplication('') };
      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
