import { CertificationVersionForbiddenDeletionError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Domain | UseCase | delete-certification-version', function () {
  it('should throw CertificationVersionForbiddenDeletionError certification-version is not draft', async function () {
    // given
    const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.CORE,
      startDate: new Date(),
      expirationDate: null,
      status: VERSION_STATUSES.ACTIVE,
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
      scope: SCOPES.CORE,
      startDate: new Date(),
      expirationDate: null,
      status: VERSION_STATUSES.DRAFT,
    });

    await databaseBuilder.commit();

    // when
    await usecases.deleteCertificationVersion({ certificationVersionId: certificationVersion.id });

    // then
    const matchingCertificationVersions = await knex
      .from('certification_versions')
      .where({ id: certificationVersion.id });
    expect(matchingCertificationVersions).to.be.empty;
  });
});
