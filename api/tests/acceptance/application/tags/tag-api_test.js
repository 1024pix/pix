import _ from 'lodash';

import {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  insertUserWithRoleCertif,
  databaseBuilder,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Route | tag-router', function () {
  describe('POST /api/admin/tags', function () {
    it('should return the created tag with 201 HTTP status code', async function () {
      // given
      const tagName = 'SUPER TAG';
      const server = await createServer();
      await databaseBuilder.commit();

      const userId = (await insertUserWithRoleSuperAdmin()).id;

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/tags',
        payload: {
          data: {
            type: 'tags',
            attributes: {
              name: tagName,
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.deep.equal('tags');
      expect(response.result.data.attributes.name).to.deep.equal(tagName);
    });

    it('should return 403 HTTP status code when the user authenticated is not SuperAdmin', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const tagName = 'un super tag';

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/tags',
        payload: {
          data: {
            type: 'tags',
            attributes: {
              name: tagName,
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/tags', function () {
    it('should return a list of tags with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const tag1 = databaseBuilder.factory.buildTag({ name: 'TAG1' });
      const tag2 = databaseBuilder.factory.buildTag({ name: 'TAG2' });
      await databaseBuilder.commit();

      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const options = {
        method: 'GET',
        url: '/api/admin/tags',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const expectedTags = [
        {
          attributes: {
            name: tag1.name,
          },
          id: tag1.id.toString(),
          type: 'tags',
        },
        {
          attributes: {
            name: tag2.name,
          },
          id: tag2.id.toString(),
          type: 'tags',
        },
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedTags);
    });

    it('should return 403 HTTP status code when the user authenticated is not SuperAdmin', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/tags',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/{id}/recently-used', function () {
    context('when an admin member with a role "SUPER_ADMIN" tries to access this resource', function () {
      it('returns a list of recently used tags with a 200 HTTP status code', async function () {
        // given
        const server = await createServer();

        const basedTag = databaseBuilder.factory.buildTag({ name: 'konoha' });
        const mostUsedTag = databaseBuilder.factory.buildTag({ name: 'kumo' });
        const leastUsedTag = databaseBuilder.factory.buildTag({ name: 'hueco mundo' });
        const tags = [mostUsedTag, databaseBuilder.factory.buildTag({ name: 'kiri' }), leastUsedTag];
        const organizations = [];

        _.times(3, () => organizations.push(databaseBuilder.factory.buildOrganization()));

        for (const [index, organization] of organizations.entries()) {
          const tagIds = tags.slice(0, index + 1).map(({ id }) => id);
          tagIds.push(basedTag.id);
          _buildOrganizationTags(organization.id, tagIds);
        }

        await databaseBuilder.commit();

        const userId = (await insertUserWithRoleSuperAdmin()).id;

        // when
        const { statusCode, result } = await server.inject({
          method: 'GET',
          url: `/api/admin/tags/${basedTag.id}/recently-used`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(statusCode).to.equal(200);
        expect(result.data.length).to.equal(3);
      });
    });

    context('when an admin member with a role "CERTIF" tries to access this resource', function () {
      it('returns an error with a 403 HTTP status code', async function () {
        // given
        const server = await createServer();

        const basedTag = databaseBuilder.factory.buildTag({ name: 'konoha' });
        const mostUsedTag = databaseBuilder.factory.buildTag({ name: 'kumo' });
        const leastUsedTag = databaseBuilder.factory.buildTag({ name: 'hueco mundo' });
        const tags = [mostUsedTag, databaseBuilder.factory.buildTag({ name: 'kiri' }), leastUsedTag];
        const organizations = [];

        _.times(3, () => organizations.push(databaseBuilder.factory.buildOrganization()));

        for (const [index, organization] of organizations.entries()) {
          const tagIds = tags.slice(0, index + 1).map(({ id }) => id);
          tagIds.push(basedTag.id);
          _buildOrganizationTags(organization.id, tagIds);
        }

        await databaseBuilder.commit();

        const userId = (await insertUserWithRoleCertif()).id;

        // when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/admin/tags/${basedTag.id}/recently-used`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});

function _buildOrganizationTags(organizationId, tagIds) {
  tagIds.forEach((tagId) => {
    databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
  });
}
