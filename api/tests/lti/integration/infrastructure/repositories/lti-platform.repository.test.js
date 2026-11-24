import { expect } from 'chai';

import { AlreadyExistingLtiPlatformError } from '../../../../../src/lti/domain/errors.js';
import { LtiPlatform } from '../../../../../src/lti/domain/models/LtiPlatform.js';
import { ltiPlatformRepository } from '../../../../../src/lti/infrastructure/repositories/lti-platform.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | LTI | Infrastructure | Repository | lti-platform', function () {
  describe('get', function () {
    it('returns a LtiPlatform by id', async function () {
      // given
      const { id: organizationId1 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId2 } = databaseBuilder.factory.buildOrganization();
      const expectedLtiPlatformData = databaseBuilder.factory.buildLtiPlatform({
        organizationIds: [organizationId2, organizationId1],
      });
      await databaseBuilder.commit();
      const expectedLtiPlatform = domainBuilder.lti.buildLtiPlatform({
        ...expectedLtiPlatformData,
        organizationIds: expectedLtiPlatformData.organizationIds.toSorted((id1, id2) => id1 - id2),
      });

      // when
      const ltiPlatform = await ltiPlatformRepository.get(expectedLtiPlatformData.id);

      // then
      expect(ltiPlatform).to.deepEqualInstance(expectedLtiPlatform);
    });

    describe('when id is not found', function () {
      it('throws a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildLtiPlatform();
        await databaseBuilder.commit();
        const notFoundId = 123;

        // when
        const err = await catchErr(ltiPlatformRepository.get)(notFoundId);

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err).to.have.property('message', 'unknown LTI platform id');
      });
    });
  });

  describe('findByIssuer', function () {
    it('returns a LtiPlatform by issuer', async function () {
      // given
      const expectedLtiPlatformData = databaseBuilder.factory.buildLtiPlatform();
      await databaseBuilder.commit();
      const expectedLtiPlatform = domainBuilder.lti.buildLtiPlatform(expectedLtiPlatformData);

      // when
      const ltiPlatform = await ltiPlatformRepository.findByIssuer(expectedLtiPlatformData.issuer);

      // then
      expect(ltiPlatform).to.deepEqualInstance(expectedLtiPlatform);
    });

    describe('when issuer is not found', function () {
      it('returns null', async function () {
        // given
        databaseBuilder.factory.buildLtiPlatform();
        await databaseBuilder.commit();
        const notFoundIssuer = 'https://not-found.example.net';

        // when
        const ltiPlatform = await ltiPlatformRepository.findByIssuer(notFoundIssuer);

        // then
        expect(ltiPlatform).to.be.null;
      });
    });
  });

  describe('findAll', function () {
    it('returns all authorized platforms', async function () {
      // given
      const platformsData = [
        databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle1.example.net' }),
        databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://lti.example.net/some/path' }),
        databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle2.example.net' }),
      ];
      await databaseBuilder.commit();

      const expectedPlatforms = platformsData
        .map(domainBuilder.lti.buildLtiPlatform)
        .toSorted(({ issuer: issuer1 }, { issuer: issuer2 }) => (issuer1 < issuer2 ? -1 : 1));

      // when
      const platforms = await ltiPlatformRepository.findAll();

      // then
      expect(platforms).to.deep.equal(expectedPlatforms);
    });
  });

  describe('create', function () {
    it('creates and returns an LTI platform', async function () {
      // given
      const issuer = 'https://moodle.example.net';

      // when
      const platform = await ltiPlatformRepository.create({ issuer });

      // then
      expect(platform).to.be.instanceOf(LtiPlatform);
      expect(platform).to.have.property('issuer', issuer);
      expect(platform).to.have.property('id').that.is.a('number');
      expect(platform).to.have.property('organizationIds').that.deep.equals([]);

      const dbPlatforms = await knex.select('issuer').from('lti_platforms');
      await expect(dbPlatforms).to.deep.equal([{ issuer }]);
    });

    describe('when issuer is already taken', function () {
      it('throws AlreadyExistingLtiPlatformError', async function () {
        // given
        const issuer = 'https://moodle.example.net';
        databaseBuilder.factory.buildLtiPlatform({ issuer });
        await databaseBuilder.commit();

        // when
        const result = ltiPlatformRepository.create({ issuer });

        // then
        await expect(result).to.be.rejectedWith(AlreadyExistingLtiPlatformError);
      });
    });
  });

  describe('addOrganizations', function () {
    it('adds missing organizations to platform', async function () {
      // given
      const { id: organizationId1 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId2 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId3 } = databaseBuilder.factory.buildOrganization();
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform({ organizationIds: [organizationId2] });
      await databaseBuilder.commit();

      // when
      const insertedCount = await ltiPlatformRepository.addOrganizations({
        platformId,
        organizationIds: [organizationId1, organizationId2, organizationId3],
      });

      // then
      expect(insertedCount).to.equal(2);
      const organizationIds = await knex
        .pluck('organizationId')
        .from('lti_platform_organizations')
        .where({ platformId })
        .orderBy('organizationId');
      expect(organizationIds).to.deep.equal(
        [organizationId1, organizationId2, organizationId3].toSorted((id1, id2) => id1 - id2),
      );
    });
  });

  describe('removeOrganizations', function () {
    it('removes organizations from platform', async function () {
      // given
      const { id: organizationId1 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId2 } = databaseBuilder.factory.buildOrganization();
      const { id: organizationId3 } = databaseBuilder.factory.buildOrganization();
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform({
        organizationIds: [organizationId1, organizationId2, organizationId3],
      });
      await databaseBuilder.commit();
      const unknownOrganizationId = 666;

      // when
      const deletedCount = await ltiPlatformRepository.removeOrganizations({
        platformId,
        organizationIds: [organizationId1, organizationId3, unknownOrganizationId],
      });

      // then
      expect(deletedCount).to.equal(2);
      const organizationIds = await knex
        .pluck('organizationId')
        .from('lti_platform_organizations')
        .where({ platformId })
        .orderBy('organizationId');
      expect(organizationIds).to.deep.equal([organizationId2]);
    });
  });
});
