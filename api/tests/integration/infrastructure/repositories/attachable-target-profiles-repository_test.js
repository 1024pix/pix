import { databaseBuilder, expect } from '../../../test-helper.js';
import * as attachableTargetProfileRepository from '../../../../lib/infrastructure/repositories/attachable-target-profiles-repository.js';

describe('Integration | Repository | attachable-target-profiles', function () {
  describe('#find', function () {
    it('should return attachable target profiles ordered by name asc, then id desc', async function () {
      // given
      new TargetProfileFactory({ id: 100, name: 'AAA' }).withBadge();
      new TargetProfileFactory({ id: 300, name: 'BBB' }).withBadge();
      new TargetProfileFactory({ id: 200, name: 'BBB' }).withBadge();
      await databaseBuilder.commit();

      // when
      const results = await attachableTargetProfileRepository.find();

      // then
      expect(results).to.deep.equal([
        { id: 100, name: 'AAA' },
        { id: 300, name: 'BBB' },
        { id: 200, name: 'BBB' },
      ]);
    });

    it('should not return outdated target profiles', async function () {
      // given
      new TargetProfileFactory({ id: 100, name: 'NOTOUTDATED' }).withBadge();
      new TargetProfileFactory({ id: 300, name: 'OUTDATED', outdated: true }).withBadge();
      await databaseBuilder.commit();

      // when
      const results = await attachableTargetProfileRepository.find();

      // then
      expect(results).to.deep.equal([{ id: 100, name: 'NOTOUTDATED' }]);
    });

    context('when the target profile has no link to a complementary', function () {
      it('should return it as an attachable target profile', async function () {
        // given
        new TargetProfileFactory({ id: 200, name: 'Target profile with a badge' }).withBadge();
        await databaseBuilder.commit();

        // when
        const results = await attachableTargetProfileRepository.find();

        // then
        expect(results).to.deep.equal([{ id: 200, name: 'Target profile with a badge' }]);
      });
    });

    context('when the target profile is not linked to any badges', function () {
      it('should return it as an attachable target profiles', async function () {
        // given
        new TargetProfileFactory({ id: 100, name: 'Not tied to a badge' });
        await databaseBuilder.commit();

        // when
        const results = await attachableTargetProfileRepository.find();

        // then
        expect(results).to.deep.equal([{ id: 100, name: 'Not tied to a badge' }]);
      });
    });

    context('when the target profile has been linked to a complementary certification', function () {
      it('should not return currently attached target profiles', async function () {
        // given
        new TargetProfileFactory({ id: 100, name: 'currentlyAttachedToATargetProfile' })
          .withBadge()
          .withComplementaryCertificationBadge({ detachedAt: null });
        await databaseBuilder.commit();

        // when
        const results = await attachableTargetProfileRepository.find();

        // then
        expect(results).to.be.empty;
      });

      it('should not return target profiles even if detached', async function () {
        // given
        new TargetProfileFactory({ id: 100, name: 'currentlyDetached' })
          .withBadge()
          .withComplementaryCertificationBadge({ detachedAt: new Date() });
        await databaseBuilder.commit();

        // when
        const results = await attachableTargetProfileRepository.find();

        // then
        expect(results).to.deep.be.empty;
      });
    });

    context('when there is a term to search for', function () {
      context('when I am searching for a target profile by its name', function () {
        it('should return attachable target profiles matching the search term in their name', async function () {
          // given
          new TargetProfileFactory({ id: 1, name: 'notAValidResult' }).withBadge();
          new TargetProfileFactory({ id: 11, name: 'notAValidResult' }).withBadge();
          new TargetProfileFactory({ id: 2, name: 'CLEA aValidResult' }).withBadge();
          new TargetProfileFactory({ id: 3, name: 'aValidResult CLEA' }).withBadge();
          new TargetProfileFactory({ id: 4, name: 'aValidCLEAResult' }).withBadge();
          await databaseBuilder.commit();

          const searchTerm = 'CLEA';

          // when
          const results = await attachableTargetProfileRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 2, name: 'CLEA aValidResult' },
            { id: 4, name: 'aValidCLEAResult' },
            { id: 3, name: 'aValidResult CLEA' },
          ]);
        });

        it('should not be case sensitive', async function () {
          // given
          new TargetProfileFactory({ id: 2, name: 'CLÉA aValidResult' }).withBadge();
          new TargetProfileFactory({ id: 3, name: 'aValidResult CléA' }).withBadge();
          new TargetProfileFactory({ id: 4, name: 'aValidCLéAResult' }).withBadge();
          new TargetProfileFactory({ id: 5, name: 'cléa' }).withBadge();
          await databaseBuilder.commit();

          const searchTerm = 'cléa';

          // when
          const results = await attachableTargetProfileRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 2, name: 'CLÉA aValidResult' },
            { id: 4, name: 'aValidCLéAResult' },
            { id: 3, name: 'aValidResult CléA' },
            { id: 5, name: 'cléa' },
          ]);
        });
      });

      context('when I am searching for a target profile by its ID', function () {
        it('should return attachable target profiles matching the search term in their id', async function () {
          // given
          new TargetProfileFactory({ id: 1, name: 'notAValidResult' }).withBadge();
          new TargetProfileFactory({ id: 2, name: 'aValidResult' }).withBadge();
          new TargetProfileFactory({ id: 12, name: 'aValidResult' }).withBadge();
          new TargetProfileFactory({ id: 21, name: 'aValidResult' }).withBadge();
          await databaseBuilder.commit();

          const searchTerm = '2';

          // when
          const results = await attachableTargetProfileRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 21, name: 'aValidResult' },
            { id: 12, name: 'aValidResult' },
            { id: 2, name: 'aValidResult' },
          ]);
        });
      });
    });
  });
});

class TargetProfileFactory {
  #targetProfile;
  #badge;
  #complementaryCertificationBadge;

  constructor(targetProfileOpts = {}) {
    const _targetProfileOpts = { isPublic: true, outdated: false, ...targetProfileOpts };
    this.withTargetProfile(_targetProfileOpts);
  }

  withTargetProfile(targetProfileOpts) {
    const _targetProfileOpts = { isPublic: true, outdated: false, ...targetProfileOpts };
    this.#targetProfile = databaseBuilder.factory.buildTargetProfile(_targetProfileOpts);
    return this;
  }

  withBadge(badgeOpts) {
    const _badgeOpts = { targetProfileId: this.#targetProfile.id, ...badgeOpts };
    this.#badge = databaseBuilder.factory.buildBadge(_badgeOpts);
    return this;
  }

  withComplementaryCertificationBadge(complementaryCertificationBadgeOpts) {
    const _badgeId = this.#badge?.id ?? this.withBadge();
    const _complementaryCertificationBadgeOpts = {
      badgeId: _badgeId,
      complementaryCertificationId: null,
      detachedAt: null,
      ...complementaryCertificationBadgeOpts,
    };
    this.#complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge(
      _complementaryCertificationBadgeOpts,
    );
    return this;
  }
}
