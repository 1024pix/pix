import { expect } from 'chai';

import { ltiPlatformRepository } from '../../../../../src/lti/infrastructure/repositories/lti-platform.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | LTI | Infrastructure | Repository | lti-platform', function () {
  describe('get', function () {
    it('returns a LtiPlatform by id', async function () {
      // given
      const expectedLtiPlatformData = databaseBuilder.factory.buildLtiPlatform();
      await databaseBuilder.commit();
      const expectedLtiPlatform = domainBuilder.lti.buildLtiPlatform(expectedLtiPlatformData);

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

  describe('findByOrigin', function () {
    it('returns a LtiPlatform by origin', async function () {
      // given
      const expectedLtiPlatformData = databaseBuilder.factory.buildLtiPlatform();
      await databaseBuilder.commit();
      const expectedLtiPlatform = domainBuilder.lti.buildLtiPlatform(expectedLtiPlatformData);

      // when
      const ltiPlatform = await ltiPlatformRepository.findByOrigin(expectedLtiPlatformData.origin);

      // then
      expect(ltiPlatform).to.deepEqualInstance(expectedLtiPlatform);
    });

    describe('when origin is not found', function () {
      it('returns null', async function () {
        // given
        databaseBuilder.factory.buildLtiPlatform();
        await databaseBuilder.commit();
        const notFoundOrigin = 'https://not-found.example.net';

        // when
        const ltiPlatform = await ltiPlatformRepository.findByOrigin(notFoundOrigin);

        // then
        expect(ltiPlatform).to.be.null;
      });
    });
  });
});
