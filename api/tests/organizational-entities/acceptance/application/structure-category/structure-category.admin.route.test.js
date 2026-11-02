import { expect } from 'chai';

import { createServer } from '../../../../../server.js';
import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
const { ROLES } = PIX_ADMIN;
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | StructureCategories', function () {
  describe('GET /api/admin/structure-categories', function () {
    Object.keys(ROLES).forEach((role) => {
      it(`returns a list of structure categories with 200 HTTP status code for user with the ${role} role`, async function () {
        // given
        const server = await createServer();
        const structureCategory1 = databaseBuilder.factory.buildStructureCategory({ id: 123, label: 'Collège' });
        const superAdmin = databaseBuilder.factory.buildUser.withRole({ role });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/admin/structure-categories',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            attributes: {
              label: structureCategory1.label,
            },
            id: '123',
            type: 'structure-categories',
          },
        ]);
      });
    });
  });
});
