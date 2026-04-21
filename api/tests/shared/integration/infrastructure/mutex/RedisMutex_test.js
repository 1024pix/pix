import { redisMutex } from '../../../../../src/shared/infrastructure/mutex/RedisMutex.js';
import { wait } from '../../../../tooling/test-utils/wait.js';

describe('Shared | Integration | Infrastructure | Mutex | RedisMutex', function () {
  describe('#lock', function () {
    context('same owner', function () {
      it('should successfully lock resource for the first time, but fail the second time because resource is already locked', async function () {
        // when
        const isLockSuccess_firstCall = await redisMutex.lock('someResourceId', 'processA');
        const isLockSuccess_secondCall = await redisMutex.lock('someResourceId', 'processA');

        // then
        expect(isLockSuccess_firstCall).to.be.true;
        expect(isLockSuccess_secondCall).to.be.false;
      });
    });

    context('different owner', function () {
      it('should successfully lock resource for the first time, but fail the second time because resource is already locked', async function () {
        // when
        const isLockSuccess_firstCall = await redisMutex.lock('someResourceId', 'processA');
        const isLockSuccess_secondCall = await redisMutex.lock('someResourceId', 'processB');

        // then
        expect(isLockSuccess_firstCall).to.be.true;
        expect(isLockSuccess_secondCall).to.be.false;
      });
    });

    it('should release automatically after expiration delay', async function () {
      const lockExpirationDelay = 250;
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
        redisMutex.lock('resource', 'A'),
        redisMutex.lock('resource', 'B'),
        redisMutex.lock('resource', 'C'),
      ]);

      const successCount = results.filter(Boolean).length;

      expect(successCount).to.equal(1);
    });
  });

  describe('#release', function () {
    context('same owner', function () {
      it('should successfully release the resource for the first time, but fail the second time because resource is already released', async function () {
        // given
        await redisMutex.lock('someResourceId', 'ownerId');

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
        await redisMutex.lock('someResourceId', 'ownerA');

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
      await redisMutex.lock('someResourceId', 'ownerA');

      await redisMutex.release('someResourceId', 'ownerA');

      const isLockSuccess = await redisMutex.lock('someResourceId', 'ownerB');

      expect(isLockSuccess).to.be.true;
    });

    it('should not release lock if ownership changed after expiration', async function () {
      await redisMutex.lock('someResourceId', 'ownerA', 100);
      await wait(120);
      await redisMutex.lock('someResourceId', 'ownerB');

      const result = await redisMutex.release('someResourceId', 'ownerA');

      expect(result).to.be.false;
    });
  });
});
