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
});
