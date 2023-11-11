import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Routes | organization-administration-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('PATCH /api/admin/organizations/{id}', function () {
    it('should return the updated organization and status code 200', async function () {
      // given
      const organizationAttributes = {
        externalId: '0446758F',
        provinceCode: '044',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
      };

      const organization = databaseBuilder.factory.buildOrganization({ ...organizationAttributes });
      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'organizations',
          id: organization.id,
          attributes: {
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
          },
        },
      };

      const options = {
        method: 'PATCH',
        url: `/api/admin/organizations/${organization.id}`,
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
