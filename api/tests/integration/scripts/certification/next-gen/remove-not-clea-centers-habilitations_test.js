import { main } from '../../../../../scripts/certification/next-gen/remove-not-clea-centers-habilitations.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Scripts | Certification | remove-not-clea-centers-habilitations', function () {
  let clea, pixPlusDroit;

  beforeEach(async function () {
    clea = databaseBuilder.factory.buildComplementaryCertification({
      key: ComplementaryCertificationKeys.CLEA,
    });
    pixPlusDroit = databaseBuilder.factory.buildComplementaryCertification({
      key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
    });
    await databaseBuilder.commit();
  });

  it('should delete center habilitations except for CLEA', async function () {
    // given
    const center = databaseBuilder.factory.buildCertificationCenter({ id: 456 });
    const anotherCenter = databaseBuilder.factory.buildCertificationCenter({ id: 789 });

    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: center.id,
      complementaryCertificationId: clea.id,
    });
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: center.id,
      complementaryCertificationId: pixPlusDroit.id,
    });
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: anotherCenter.id,
      complementaryCertificationId: pixPlusDroit.id,
    });
    await databaseBuilder.commit();

    // when
    await main({ isDryRun: false });

    // then
    const habilitationsRemaining = await knex('complementary-certification-habilitations').select(
      'complementaryCertificationId',
    );
    expect(habilitationsRemaining).to.have.lengthOf(1);
    expect(habilitationsRemaining[0].complementaryCertificationId).to.equal(clea.id);
  });

  context('when is DRY RUN', function () {
    it('should not delete any center habiliations', async function () {
      // given
      const center = databaseBuilder.factory.buildCertificationCenter({ id: 111 });
      const anotherCenter = databaseBuilder.factory.buildCertificationCenter({ id: 222 });

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: center.id,
        complementaryCertificationId: clea.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: center.id,
        complementaryCertificationId: pixPlusDroit.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: anotherCenter.id,
        complementaryCertificationId: pixPlusDroit.id,
      });
      await databaseBuilder.commit();

      // when
      await main({});

      // then
      const habilitationsRemaining = await knex('complementary-certification-habilitations').select(
        'complementaryCertificationId',
      );
      expect(habilitationsRemaining).to.have.lengthOf(3);
      expect(habilitationsRemaining).to.deep.equal([
        { complementaryCertificationId: clea.id },
        { complementaryCertificationId: pixPlusDroit.id },
        { complementaryCertificationId: pixPlusDroit.id },
      ]);
    });
  });
});
