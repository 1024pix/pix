import sinon from 'sinon';

import { TrainingTriggerForAdmin } from '../../../../../src/devcomp/domain/read-models/TrainingTriggerForAdmin.js';
import { duplicateTraining } from '../../../../../src/devcomp/domain/usecases/duplicate-training.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Devcomp | Domain | UseCases | duplicate-training', function () {
  it('should duplicate provided training with same training-triggers', async function () {
    // given
    const trainingId = 123456;
    const area1 = domainBuilder.buildArea({ id: 'recArea1' });
    const area2 = domainBuilder.buildArea({ id: 'recArea2' });
    const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', areaId: 'recArea1' });
    const competence2InAnotherArea = domainBuilder.buildCompetence({ id: 'recCompetence2', areaId: 'recArea2' });
    const thematic1 = domainBuilder.buildThematic({ id: 'recThematic1', competenceId: 'recCompetence1' });
    const thematic2 = domainBuilder.buildThematic({ id: 'recThematic2', competenceId: 'recCompetence1' });
    const thematic3InAnotherCompetence = domainBuilder.buildThematic({
      id: 'recThematic3',
      competenceId: 'recCompetence2',
    });
    const tube1 = domainBuilder.buildTube({
      id: 'recTube1',
      thematicId: thematic1.id,
    });
    const tube2 = domainBuilder.buildTube({
      id: 'recTube2',
      thematicId: thematic2.id,
    });
    const tube3 = domainBuilder.buildTube({
      id: 'recTube3',
      thematicId: thematic3InAnotherCompetence.id,
    });
    const trainingTriggerTube1 = domainBuilder.buildTrainingTriggerTube({
      id: 'recTrainingTriggerTube1',
      level: 1,
      tube: tube1,
    });
    const trainingTriggerTube2 = domainBuilder.buildTrainingTriggerTube({
      id: 'recTrainingTriggerTube2',
      level: 2,
      tube: tube2,
    });
    const trainingTriggerTube3 = domainBuilder.buildTrainingTriggerTube({
      id: 'recTrainingTriggerTube3',
      level: 3,
      tube: tube3,
    });

    const trainingTrigger = domainBuilder.buildTrainingTriggerForAdmin({
      type: TrainingTriggerForAdmin.types.PREREQUISITE,
      areas: [area1, area2],
      competences: [competence1, competence2InAnotherArea],
      thematics: [thematic1, thematic2, thematic3InAnotherCompetence],
      triggerTubes: [trainingTriggerTube1, trainingTriggerTube2, trainingTriggerTube3],
    });

    const training = domainBuilder.buildTrainingForAdmin({
      id: trainingId,
      title: 'Training 1',
      internalTitle: 'Training 1 internal title',
      link: 'https://example.net',
      type: 'webinar',
      duration: { hours: 5 },
      locales: ['fr-fr'],
      targetProfileIds: [1, 2, 3],
      editorName: 'Editor name',
      editorLogoUrl: 'https://editor.logo.url',
      trainingTriggers: [trainingTrigger],
    });
    const trainingToCreate = {
      ...training,
      internalTitle: '[Copie] Training 1 internal title',
    };
    const newTrainingId = 654321;
    const newTraining = { ...trainingToCreate, id: newTrainingId };

    const trainingRepositoryStub = {
      get: sinon.stub().resolves(training),
      create: sinon.stub().resolves(newTraining),
    };
    const trainingTriggerRepositoryStub = {
      findByTrainingIdForAdmin: sinon.stub().resolves([trainingTrigger]),
      createOrUpdate: sinon.stub(),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());

    // when
    const result = await duplicateTraining({
      trainingId,
      trainingRepository: trainingRepositoryStub,
      trainingTriggerRepository: trainingTriggerRepositoryStub,
    });

    // then
    expect(trainingRepositoryStub.get).to.have.been.calledWithExactly({ trainingId });
    expect(trainingRepositoryStub.create).to.have.been.calledWithExactly({
      training: trainingToCreate,
    });
    expect(trainingTriggerRepositoryStub.findByTrainingIdForAdmin).to.have.been.calledWithExactly({ trainingId });
    expect(trainingTriggerRepositoryStub.createOrUpdate).to.have.been.calledWithExactly({
      trainingId: newTrainingId,
      triggerTubesForCreation: [
        { tubeId: tube1.id, level: 1 },
        { tubeId: tube2.id, level: 2 },
        { tubeId: tube3.id, level: 3 },
      ],
      type: trainingTrigger.type,
      threshold: trainingTrigger.threshold,
    });
    expect(result).to.deep.equal(newTraining);
  });
});
