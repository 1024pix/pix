import { expect } from 'chai';

import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Domain | UseCase | update-version', function () {
  it('updates the version', async function () {
    // given
    const version = databaseBuilder.factory.buildCertificationVersion();
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'coucou',
      versionId: version.id,
    });
    await databaseBuilder.commit();

    const newComments = 'new comments';

    // when
    await usecases.updateVersion({ id: version.id, comments: newComments });

    // then
    const updatedVersion = await knex('certification_versions').where({ id: version.id }).first();
    expect(updatedVersion.comments).to.equal(newComments);
  });

  it('throws an error when no version is found', async function () {
    // given
    databaseBuilder.factory.buildCertificationVersion({ id: 123 });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'coucou',
      versionId: 123,
    });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(usecases.updateVersion)({ id: 456, comments: 'new comments' });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
