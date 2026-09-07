import { expect } from 'chai';

import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import * as versionRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Domain | UseCase | save-scoring-configuration', function () {
  it('updates globalScoringConfiguration and competencesScoringConfiguration on an active version', async function () {
    // given
    domainBuilder.certification.configuration
      .versionBuilder()
      .asActive()
      .withParameters({
        id: 123,
        scope: SCOPES.PIX_PLUS_DROIT,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: null,
      })
      .insertToDB({ databaseBuilder });
    await databaseBuilder.commit();

    const globalScoringConfiguration = [{ meshLevel: 1, bounds: { min: 0, max: 100 } }];

    // when
    await usecases.saveScoringConfiguration({
      id: 123,
      globalScoringConfiguration,
      competencesScoringConfiguration: null,
    });

    // then
    const updatedVersion = await versionRepository.getById({ id: 123 });
    expect(updatedVersion.globalScoringConfiguration).to.deep.equal(globalScoringConfiguration);
    expect(updatedVersion.competencesScoringConfiguration).to.be.null;
  });
});
