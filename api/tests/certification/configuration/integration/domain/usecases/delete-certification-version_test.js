import { CertificationVersionForbiddenDeletionError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Domain | UseCase | delete-certification-version', function () {
  it('should throw CertificationVersionForbiddenDeletionError when version cannot be removed', async function () {
    // given
    const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
      status: VERSION_STATUSES.ACTIVE,
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'coucou',
      versionId: certificationVersion.id,
    });

    await databaseBuilder.commit();

    // when
    const error = await catchErr(usecases.deleteCertificationVersion)({
      certificationVersionId: certificationVersion.id,
    });
    // then
    expect(error).to.be.instanceOf(CertificationVersionForbiddenDeletionError);
  });

  it('should delete given certification version', async function () {
    // given
    const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
      status: VERSION_STATUSES.DRAFT,
    });
    databaseBuilder.factory.buildCertificationVersionTube({ versionId: certificationVersion.id, tubeId: 'rec1' });
    await databaseBuilder.commit();

    // when
    await usecases.deleteCertificationVersion({ certificationVersionId: certificationVersion.id });

    // then
    const matchingCertificationVersions = await knex
      .from('certification_versions')
      .where({ id: certificationVersion.id });
    const matchingCertificationVersionsTubes = await knex
      .from('certification_versions_tubes')
      .where({ tube_id: 'rec1' });
    expect(matchingCertificationVersions).to.be.empty;
    expect(matchingCertificationVersionsTubes).to.be.empty;
  });
});
