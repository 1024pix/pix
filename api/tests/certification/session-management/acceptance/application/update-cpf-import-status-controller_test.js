import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

import nock from 'nock';

import { createServer } from '../../../../../server.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Acceptance | Controller | Session | update-cpf-import-status-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();

    nock('http://cpf-receipts.fake.endpoint.example.net:80')
      .get('/cpfReceipts.bucket/?list-type=2')
      .replyWithFile(200, __dirname + '/files/xml/integrateCpfProccessingReceiptsListObjectsV2.xml', {
        'Content-Type': 'application/xml',
      });

    nock('http://cpf-receipts.fake.endpoint.example.net:80')
      .get(
        '/cpfReceipts.bucket/Accus%C3%A9%20de%20traitement_pix-cpf-export-20231016-223357_002.xml_20231025.xml?x-id=GetObject',
      )
      .reply(200, () => fs.createReadStream(path.join(__dirname, 'files/xml/cpfImportLog.xml'), 'utf8'));

    nock('http://cpf-receipts.fake.endpoint.example.net:80')
      .delete(
        '/cpfReceipts.bucket/Accus%C3%A9%20de%20traitement_pix-cpf-export-20231016-223357_002.xml_20231025.xml?x-id=DeleteObject',
      )
      .reply(200);
  });

  describe('PUT /api/admin/cpf/receipts', function () {
    it('should return an OK (200) status', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: '/api/admin/cpf/receipts',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when user cant access the session', function () {
      it('should respond with a 403', async function () {
        // when
        const options = {
          method: 'PUT',
          url: '/api/admin/cpf/receipts',
          headers: generateAuthenticatedUserRequestHeaders({ userId: 1 }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
