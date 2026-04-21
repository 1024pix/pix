import sinon from 'sinon';

import { RecommendableModule } from '../../../../../src/devcomp/domain/read-models/RecommendableModule.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('DevComp | Integration | Domain | Usecases | findRecommendableModulesByTargetProfileIds', function () {
  it('it returns recommended modules for given target-profile ids', async function () {
    // given
    const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
    const targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;
    const moduleId = '5df14039-803b-4db4-9778-67e4b84afbbd';
    const training = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/adresse-ip-publique-et-vous',
    });

    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfileId1, trainingId: training.id });
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfileId2, trainingId: training.id });
    await databaseBuilder.commit();

    const recommendedModules = await usecases.findRecommendableModulesByTargetProfileIds({
      targetProfileIds: [targetProfileId1, targetProfileId2],
    });

    expect(recommendedModules).to.have.lengthOf(1);
    expect(recommendedModules[0]).to.be.an.instanceOf(RecommendableModule);
    expect(recommendedModules[0]).to.be.deep.equal({
      id: training.id,
      moduleId,
      shortId: 'ecc13f55',
      targetProfileIds: [targetProfileId1, targetProfileId2],
    });
  });
  it('it returns recommended modules for given target-profile ids when link is absolute', async function () {
    // given
    const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
    const moduleId = '5df14039-803b-4db4-9778-67e4b84afbbd';
    const training = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/adresse-ip-publique-et-vous',
    });

    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfileId1, trainingId: training.id });
    await databaseBuilder.commit();

    //when
    const recommendedModules = await usecases.findRecommendableModulesByTargetProfileIds({
      targetProfileIds: [targetProfileId1],
    });

    //then
    expect(recommendedModules).to.have.lengthOf(1);
    expect(recommendedModules[0]).to.be.an.instanceOf(RecommendableModule);
    expect(recommendedModules[0]).to.be.deep.equal({
      id: training.id,
      moduleId,
      shortId: 'ecc13f55',
      targetProfileIds: [targetProfileId1],
    });
  });
  it('ignores module when its slug does not pass regex', async function () {
    // given
    sinon.stub(logger, 'error').returns();

    const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
    const training = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: 'http://app.pix.fr/campagnes/COMBINIX1',
    });
    const module2Id = '5df14039-803b-4db4-9778-67e4b84afbbd';

    const training2 = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/adresse-ip-publique-et-vous',
    });

    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfileId1, trainingId: training.id });
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfileId1, trainingId: training2.id });

    await databaseBuilder.commit();

    // when
    const recommendedModules = await usecases.findRecommendableModulesByTargetProfileIds({
      targetProfileIds: [targetProfileId1],
    });
    // then
    expect(logger.error).to.have.been.calledWithExactly({
      message: `Erreur sur le lien de la ressource : ${training.link}`,
    });
    expect(recommendedModules).to.have.lengthOf(1);
    expect(recommendedModules[0]).to.be.an.instanceOf(RecommendableModule);
    expect(recommendedModules[0]).to.be.deep.equal({
      id: training2.id,
      moduleId: module2Id,
      shortId: 'ecc13f55',
      targetProfileIds: [targetProfileId1],
    });
  });
});
