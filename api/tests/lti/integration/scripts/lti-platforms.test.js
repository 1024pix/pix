import { expect } from 'chai';
import sinon from 'sinon';

import { LtiPlatformsScript } from '../../../../src/lti/scripts/lti-platforms.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Integration | LTI | Scripts | lti-platforms', function () {
  let script;

  beforeEach(function () {
    script = new LtiPlatformsScript();
  });

  describe('list', function () {
    it('displays authorized LTI platforms using console.table', async function () {
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

      const console = {
        table: sinon.stub(),
      };

      // when
      await script.list({}, { console, logger });

      // then
      expect(console.table).to.have.been.calledOnceWithExactly(expectedPlatforms);
    });
  });

  describe('add', function () {
    it('authorizes a new LTI platform', async function () {
      // issuer
      const issuer = 'https://lti.example.net/some/path';

      // when
      await script.add({ issuer }, { logger });

      // then
      const dbPlatforms = await knex.select('issuer').from('lti_platforms');
      expect(dbPlatforms).to.deep.equal([{ issuer }]);
    });
  });

  describe('registrations', function () {
    it('displays registrations for LTI platform using console.table', async function () {
      // given
      const { id: platformId1 } = databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle1.example.net' });
      const { id: platformId2 } = databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle2.example.net' });
      const registration1Data = databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'qwer1357',
        platformId: platformId1,
        status: 'pending',
      });
      const registration2Data = databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'asdf2468',
        platformId: platformId1,
        status: 'active',
      });
      databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'poiu0987',
        platformId: platformId2,
      });
      await databaseBuilder.commit();

      const expectedRegistrations = [registration1Data, registration2Data]
        .map(({ clientId, status }) => ({ clientId, status }))
        .toSorted(({ clientId: clientId1 }, { clientId: clientId2 }) => (clientId1 < clientId2 ? -1 : 1));

      const console = {
        table: sinon.stub(),
      };

      // when
      await script.registrations({ platformId: platformId1 }, { console, logger });

      // then
      expect(console.table).to.have.been.calledOnceWithExactly(expectedRegistrations);
    });
  });
});
