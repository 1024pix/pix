import { expect } from 'chai';

import { redisMutex } from '../../../../../src/shared/infrastructure/mutex/RedisMutex.js';
import { wait } from '../../../../tooling/test-utils/wait.js';

describe('Shared | Integration | Infrastructure | Mutex | RedisMutex', function () {
  let lockExpirationDelay = 5_000;
  describe('#lock', function () {
    context('same owner', function () {
      it('should successfully lock resource for the first time, but fail the second time because resource is already locked', async function () {
        // when
        const isLockSuccess_firstCall = await redisMutex.lock('someResourceId', 'processA', lockExpirationDelay);
        const isLockSuccess_secondCall = await redisMutex.lock('someResourceId', 'processA', lockExpirationDelay);

        // then
        expect(isLockSuccess_firstCall).to.be.true;
        expect(isLockSuccess_secondCall).to.be.false;
      });
    });

    context('different owner', function () {
      it('should successfully lock resource for the first time, but fail the second time because resource is already locked', async function () {
        // when
        const isLockSuccess_firstCall = await redisMutex.lock('someResourceId', 'processA', lockExpirationDelay);
        const isLockSuccess_secondCall = await redisMutex.lock('someResourceId', 'processB', lockExpirationDelay);

        // then
        expect(isLockSuccess_firstCall).to.be.true;
        expect(isLockSuccess_secondCall).to.be.false;
      });
    });

    it('should release automatically after expiration delay', async function () {
      lockExpirationDelay = 250;
      await redisMutex.lock('someResourceId', 'ownerId', lockExpirationDelay);

      // when
      const isLockSuccess_beforeDelay1 = await redisMutex.lock('someResourceId', 'ownerId', lockExpirationDelay);
      await wait(100);
      const isLockSuccess_beforeDelay2 = await redisMutex.lock('someResourceId', 'ownerId', lockExpirationDelay);
      await wait(151);
      const isLockSuccess_afterDelay = await redisMutex.lock('someResourceId', 'ownerId', lockExpirationDelay);

      // then
      expect(isLockSuccess_beforeDelay1).to.be.false;
      expect(isLockSuccess_beforeDelay2).to.be.false;
      expect(isLockSuccess_afterDelay).to.be.true;
    });

    it('only allows one process to take the lock', async function () {
      const results = await Promise.all([
        redisMutex.lock('resource', 'A', lockExpirationDelay),
        redisMutex.lock('resource', 'B', lockExpirationDelay),
        redisMutex.lock('resource', 'C', lockExpirationDelay),
      ]);

      const successCount = results.filter(Boolean).length;

      expect(successCount).to.equal(1);
    });
  });

  describe('#release', function () {
    context('same owner', function () {
      it('should successfully release the resource for the first time, but fail the second time because resource is already released', async function () {
        // given
        await redisMutex.lock('someResourceId', 'ownerId', lockExpirationDelay);

        // when
        const isReleaseSuccess_firstCall = await redisMutex.release('someResourceId', 'ownerId');
        const isReleaseSuccess_secondCall = await redisMutex.release('someResourceId', 'ownerId');

        // then
        expect(isReleaseSuccess_firstCall).to.be.true;
        expect(isReleaseSuccess_secondCall).to.be.false;
      });
    });

    context('different owner', function () {
      it('should always fail to release the resource because owner is not the right one', async function () {
        // given
        await redisMutex.lock('someResourceId', 'ownerA', lockExpirationDelay);

        // when
        const isReleaseSuccess = await redisMutex.release('someResourceId', 'ownerB');

        // then
        expect(isReleaseSuccess).to.be.false;
      });
    });

    it('should fail to release a resource that was never locked', async function () {
      const result = await redisMutex.release('unknownResource', 'ownerA');

      expect(result).to.be.false;
    });
  });

  describe('lock and release scenarios', function () {
    it('should allow locking again after release', async function () {
      await redisMutex.lock('someResourceId', 'ownerA', lockExpirationDelay);

      await redisMutex.release('someResourceId', 'ownerA');

      const isLockSuccess = await redisMutex.lock('someResourceId', 'ownerB', lockExpirationDelay);

      expect(isLockSuccess).to.be.true;
    });

    it('should not release lock if ownership changed after expiration', async function () {
      await redisMutex.lock('someResourceId', 'ownerA', 100);
      await wait(120);
      await redisMutex.lock('someResourceId', 'ownerB', lockExpirationDelay);

      const result = await redisMutex.release('someResourceId', 'ownerA');

      expect(result).to.be.false;
    });
  });
});
