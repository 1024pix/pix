import { expect, domainBuilder } from '../../../../../test-helper.js';
import { InvalidStageError } from '../../../../../../lib/domain/errors.js';
import { StageCollectionUpdate } from '../../../../../../src/shared/domain/models/target-profile-management/StageCollectionUpdate.js';

describe('Unit | Domain | Models | target-profile-management/StageCollectionUpdate', function () {
  describe('constructor', function () {
    context('when business rules are invalid', function () {
      context('when in a threshold collection', function () {
        context('when collection has no zero stage but has some other stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 10,
                title: 'Palier seuil 10 titre',
                message: 'Palier seuil 10 message',
                prescriberTitle: 'Palier seuil 10 titre prescripteur',
                prescriberDescription: 'Palier seuil 10 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 50,
                title: 'Palier seuil 50 titre',
                message: 'Palier seuil 50 message',
                prescriberTitle: 'Palier seuil 50 titre prescripteur',
                prescriberDescription: 'Palier seuil 50 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('La présence du palier zéro est obligatoire.');
            }
          });
        });
        context('when collection has at least one stage without a value', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: null,
                title: 'Palier seuil titre',
                message: 'Palier seuil message',
                prescriberTitle: 'Palier seuil titre prescripteur',
                prescriberDescription: 'Palier seuil message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les paliers doivent avoir une valeur de seuil ou de niveau.');
            }
          });
        });
        context('when collection does not have exclusively threshold stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 50,
                title: 'Palier seuil 50 titre',
                message: 'Palier seuil 50 message',
                prescriberTitle: 'Palier seuil 50 titre prescripteur',
                prescriberDescription: 'Palier seuil 50 message prescripteur',
              },
              {
                id: null,
                level: 5,
                threshold: null,
                title: 'Palier niveau 5 titre',
                message: 'Palier niveau 5 message',
                prescriberTitle: 'Palier niveau 5 titre prescripteur',
                prescriberDescription: 'Palier niveau 5 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les paliers doivent être tous en niveau ou seuil.');
            }
          });
        });
        context('when collection has several occurrences of the same stage threshold value', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 50,
                title: 'Palier seuil 50 titre',
                message: 'Palier seuil 50 message',
                prescriberTitle: 'Palier seuil 50 titre prescripteur',
                prescriberDescription: 'Palier seuil 50 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 60,
                title: 'Palier seuil 60 titre',
                message: 'Palier seuil 60 message',
                prescriberTitle: 'Palier seuil 60 titre prescripteur',
                prescriberDescription: 'Palier seuil 60 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 60,
                title: 'Palier seuil 60 titre 2',
                message: 'Palier seuil 60 message 2',
                prescriberTitle: 'Palier seuil 60 titre prescri 2',
                prescriberDescription: 'Palier seuil 60 message prescri 2',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les valeurs de seuil/niveau doivent être uniques.');
            }
          });
        });
        context('when collection has at least one stage without title', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: null,
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le titre et le message d'un palier sont obligatoires.");
            }
          });
        });
        context('when collection has at least one stage without message', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: null,
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le titre et le message d'un palier sont obligatoires.");
            }
          });
        });
        context('when collection has a stage threshold that exceeds 100', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 101,
                title: 'Palier seuil 10 titre',
                message: 'Palier seuil 10 message',
                prescriberTitle: 'Palier seuil 10 titre prescripteur',
                prescriberDescription: 'Palier seuil 10 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Le seuil ne doit pas dépasser 100.');
            }
          });
        });
        context('when collection has a stage threshold under zero', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: -1,
                title: 'Palier seuil 10 titre',
                message: 'Palier seuil 10 message',
                prescriberTitle: 'Palier seuil 10 titre prescripteur',
                prescriberDescription: 'Palier seuil 10 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Le seuil doit être supérieur à zéro.');
            }
          });
        });
        context(
          'when input collection submit for update a stage that does not belong to the original collection',
          function () {
            it('should throw an error', function () {
              // given
              const oldStages = [
                {
                  id: 456,
                  level: null,
                  threshold: 0,
                  title: 'Palier seuil 0 titre',
                  message: 'Palier seuil 0 message',
                  prescriberTitle: 'Palier seuil 0 titre prescripteur',
                  prescriberDescription: 'Palier seuil 0 message prescripteur',
                },
              ];
              const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
                stages: oldStages,
                maxLevel: 8,
              });
              const stagesDTO = [
                {
                  id: 123,
                  level: null,
                  threshold: 10,
                  title: 'Palier seuil 10 titre',
                  message: 'Palier seuil 10 message',
                  prescriberTitle: 'Palier seuil 10 titre prescripteur',
                  prescriberDescription: 'Palier seuil 10 message prescripteur',
                },
                {
                  id: 456,
                  level: null,
                  threshold: 0,
                  title: 'Palier seuil 0 titre',
                  message: 'Palier seuil 0 message',
                  prescriberTitle: 'Palier seuil 0 titre prescripteur',
                  prescriberDescription: 'Palier seuil 0 message prescripteur',
                },
              ];

              // when
              try {
                new StageCollectionUpdate({ stagesDTO, stageCollection });
                expect.fail('Expected error to have been thrown');
              } catch (err) {
                // then
                expect(err).to.be.instanceOf(InvalidStageError);
                expect(err.message).to.equal(
                  "La modification de paliers n'est autorisé que pour les paliers appartenant au profil cible.",
                );
              }
            });
          },
        );
        context('when collection has several first skill stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: null,
                isFirstSkill: true,
                title: 'Palier premier acquis 1 titre',
                message: 'Palier premier acquis 1 message',
                prescriberTitle: 'Palier premier acquis 1 titre prescripteur',
                prescriberDescription: 'Palier premier acquis 1 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 0,
                isFirstSkill: false,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: null,
                isFirstSkill: true,
                title: 'Palier premier acquis 2 titre',
                message: 'Palier premier acquis 2 message',
                prescriberTitle: 'Palier premier acquis 2 titre prescripteur',
                prescriberDescription: 'Palier premier acquis 2 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Il ne peut y avoir qu'un seul palier premier acquis.");
            }
          });
        });
        context('when collection has a first skill stage with a threshold', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 20,
                isFirstSkill: true,
                title: 'Palier premier acquis invalide titre',
                message: 'Palier premier acquis invalide message',
                prescriberTitle: 'Palier premier acquis invalide titre prescripteur',
                prescriberDescription: 'Palier premier acquis invalide message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Un palier de premier acquis ne peut pas avoir de niveau ou de seuil.');
            }
          });
        });
      });
      context('when in a level collection', function () {
        context('when collection has no zero stage but has some other stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: 1,
                threshold: null,
                title: 'Palier niveau 1 titre',
                message: 'Palier niveau 1 message',
                prescriberTitle: 'Palier niveau 1 titre prescripteur',
                prescriberDescription: 'Palier niveau 1 message prescripteur',
              },
              {
                id: null,
                level: 5,
                threshold: null,
                title: 'Palier niveau 5 titre',
                message: 'Palier niveau 5 message',
                prescriberTitle: 'Palier niveau 5 titre prescripteur',
                prescriberDescription: 'Palier niveau 5 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('La présence du palier zéro est obligatoire.');
            }
          });
        });
        context('when collection has at least one stage without a value', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: null,
                title: 'Palier niveau titre',
                message: 'Palier niveau message',
                prescriberTitle: 'Palier niveau titre prescripteur',
                prescriberDescription: 'Palier niveau message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les paliers doivent avoir une valeur de seuil ou de niveau.');
            }
          });
        });
        context('when collection does not have exclusively level stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: null,
                threshold: 0,
                title: 'Palier seuil 0 titre',
                message: 'Palier seuil 0 message',
                prescriberTitle: 'Palier seuil 0 titre prescripteur',
                prescriberDescription: 'Palier seuil 0 message prescripteur',
              },
              {
                id: null,
                level: 5,
                threshold: null,
                title: 'Palier niveau 5 titre',
                message: 'Palier niveau 5 message',
                prescriberTitle: 'Palier niveau 5 titre prescripteur',
                prescriberDescription: 'Palier niveau 5 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: 50,
                title: 'Palier seuil 50 titre',
                message: 'Palier seuil 50 message',
                prescriberTitle: 'Palier seuil 50 titre prescripteur',
                prescriberDescription: 'Palier seuil 50 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les paliers doivent être tous en niveau ou seuil.');
            }
          });
        });
        context('when collection has several occurrences of the same stage level value', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 1 titre prescripteur',
                prescriberDescription: 'Palier niveau 1 message prescripteur',
              },
              {
                id: null,
                level: 5,
                threshold: null,
                title: 'Palier niveau 5 titre',
                message: 'Palier niveau 5 message',
                prescriberTitle: 'Palier niveau 5 titre prescripteur',
                prescriberDescription: 'Palier niveau 5 message prescripteur',
              },
              {
                id: null,
                level: 7,
                threshold: null,
                title: 'Palier niveau 7 titre',
                message: 'Palier niveau 7 message',
                prescriberTitle: 'Palier niveau 7 titre prescripteur',
                prescriberDescription: 'Palier niveau 7 message prescripteur',
              },
              {
                id: null,
                level: 7,
                threshold: null,
                title: 'Palier niveau 7 titre 2',
                message: 'Palier niveau 7 message 2',
                prescriberTitle: 'Palier niveau 7 titre prescri 2',
                prescriberDescription: 'Palier niveau 7 message prescri 2',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Les valeurs de seuil/niveau doivent être uniques.');
            }
          });
        });
        context('when collection has at least one stage without title', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: null,
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le titre et le message d'un palier sont obligatoires.");
            }
          });
        });
        context('when collection has at least one stage without message', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 8 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: null,
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le titre et le message d'un palier sont obligatoires.");
            }
          });
        });
        context('when collection has a stage level that exceeds max level', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
              {
                id: null,
                level: 2,
                threshold: null,
                title: 'Palier niveau 2 titre',
                message: 'Palier niveau 2 message',
                prescriberTitle: 'Palier niveau 2 titre prescripteur',
                prescriberDescription: 'Palier niveau 2 message prescripteur',
              },
              {
                id: null,
                level: 3,
                threshold: null,
                title: 'Palier niveau 3 titre',
                message: 'Palier niveau 3 message',
                prescriberTitle: 'Palier niveau 3 titre prescripteur',
                prescriberDescription: 'Palier niveau 3 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le niveau d'un palier dépasse le niveau maximum du profil cible.");
            }
          });
        });
        context('when collection has a stage level under zero', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
              {
                id: null,
                level: 2,
                threshold: null,
                title: 'Palier niveau 2 titre',
                message: 'Palier niveau 2 message',
                prescriberTitle: 'Palier niveau 2 titre prescripteur',
                prescriberDescription: 'Palier niveau 2 message prescripteur',
              },
              {
                id: null,
                level: -1,
                threshold: null,
                title: 'Palier niveau 3 titre',
                message: 'Palier niveau 3 message',
                prescriberTitle: 'Palier niveau 3 titre prescripteur',
                prescriberDescription: 'Palier niveau 3 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Le niveau d'un palier doit être supérieur à zéro.");
            }
          });
        });
        context(
          'when input collection submit for update a stage that does not belong to the original collection',
          function () {
            it('should throw an error', function () {
              // given
              const oldStages = [
                {
                  id: 456,
                  level: 0,
                  threshold: null,
                  title: 'Palier niveau 0 titre',
                  message: 'Palier niveau 0 message',
                  prescriberTitle: 'Palier niveau 0 titre prescripteur',
                  prescriberDescription: 'Palier niveau 0 message prescripteur',
                },
              ];
              const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
                stages: oldStages,
                maxLevel: 8,
              });
              const stagesDTO = [
                {
                  id: 123,
                  level: 1,
                  threshold: null,
                  title: 'Palier niveau 1 titre',
                  message: 'Palier niveau 1 message',
                  prescriberTitle: 'Palier niveau 1 titre prescripteur',
                  prescriberDescription: 'Palier niveau 1 message prescripteur',
                },
                {
                  id: 456,
                  level: 0,
                  threshold: null,
                  title: 'Palier niveau 0 titre',
                  message: 'Palier niveau 0 message',
                  prescriberTitle: 'Palier niveau 0 titre prescripteur',
                  prescriberDescription: 'Palier niveau 0 message prescripteur',
                },
              ];

              // when
              try {
                new StageCollectionUpdate({ stagesDTO, stageCollection });
                expect.fail('Expected error to have been thrown');
              } catch (err) {
                // then
                expect(err).to.be.instanceOf(InvalidStageError);
                expect(err.message).to.equal(
                  "La modification de paliers n'est autorisé que pour les paliers appartenant au profil cible.",
                );
              }
            });
          },
        );
        context('when collection has several first skill stages', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                isFirstSkill: false,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: null,
                isFirstSkill: true,
                title: 'Palier premier acquis 1 titre',
                message: 'Palier premier acquis 1 message',
                prescriberTitle: 'Palier premier acquis 1 titre prescripteur',
                prescriberDescription: 'Palier premier acquis 1 message prescripteur',
              },
              {
                id: null,
                level: null,
                threshold: null,
                isFirstSkill: true,
                title: 'Palier premier acquis 2 titre',
                message: 'Palier premier acquis 2 message',
                prescriberTitle: 'Palier premier acquis 2 titre prescripteur',
                prescriberDescription: 'Palier premier acquis 2 message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal("Il ne peut y avoir qu'un seul palier premier acquis.");
            }
          });
        });
        context('when collection has a first skill stage with a level', function () {
          it('should throw an error', function () {
            // given
            const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({ maxLevel: 2 });
            const stagesDTO = [
              {
                id: null,
                level: 0,
                threshold: null,
                title: 'Palier niveau 0 titre',
                message: 'Palier niveau 0 message',
                prescriberTitle: 'Palier niveau 0 titre prescripteur',
                prescriberDescription: 'Palier niveau 0 message prescripteur',
              },
              {
                id: null,
                level: 1,
                threshold: null,
                isFirstSkill: true,
                title: 'Palier premier acquis invalide titre',
                message: 'Palier premier acquis invalide message',
                prescriberTitle: 'Palier premier acquis invalide titre prescripteur',
                prescriberDescription: 'Palier premier acquis invalide message prescripteur',
              },
            ];

            // when
            try {
              new StageCollectionUpdate({ stagesDTO, stageCollection });
              expect.fail('Expected error to have been thrown');
            } catch (err) {
              // then
              expect(err).to.be.instanceOf(InvalidStageError);
              expect(err.message).to.equal('Un palier de premier acquis ne peut pas avoir de niveau ou de seuil.');
            }
          });
        });
      });
    });
    context('when business rules are valid', function () {
      context('when in a threshold collection', function () {
        it('should successfully build the collection', function () {
          // given
          const oldStages = [
            {
              id: 123,
              level: null,
              threshold: 0,
              title: 'Palier seuil 0 titre',
              message: 'Palier seuil 0 message',
              prescriberTitle: 'Palier seuil 0 titre prescripteur',
              prescriberDescription: 'Palier seuil 0 message prescripteur',
            },
            {
              id: 456,
              level: null,
              threshold: 50,
              title: 'Palier seuil 50 titre',
              message: 'Palier seuil 50 message',
              prescriberTitle: 'Palier seuil 50 titre prescripteur',
              prescriberDescription: 'Palier seuil 50 message prescripteur',
            },
            {
              id: 789,
              level: null,
              threshold: 60,
              title: 'Palier seuil 60 titre',
              message: 'Palier seuil 60 message',
              prescriberTitle: 'Palier seuil 60 titre prescripteur',
              prescriberDescription: 'Palier seuil 60 message prescripteur',
            },
          ];
          const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: oldStages,
            maxLevel: 8,
          });
          const stagesDTO = [
            {
              id: '123',
              level: null,
              threshold: 0,
              title: 'Palier seuil 0 titre',
              message: 'Palier seuil 0 message',
              prescriberTitle: 'Palier seuil 0 titre prescripteur',
              prescriberDescription: 'Palier seuil 0 message prescripteur',
            },
            {
              id: 456,
              level: null,
              threshold: 50,
              title: 'Palier seuil 50 titre',
              message: 'Palier seuil 50 message',
              prescriberTitle: 'Palier seuil 50 titre prescripteur',
              prescriberDescription: 'Palier seuil 50 message prescripteur',
            },
            {
              id: 789,
              level: null,
              threshold: 60,
              title: 'Palier seuil 60 titre',
              message: 'Palier seuil 60 message',
              prescriberTitle: 'Palier seuil 60 titre prescripteur',
              prescriberDescription: 'Palier seuil 60 message prescripteur',
            },
            {
              id: null,
              level: null,
              threshold: 80,
              title: 'Palier seuil 80 titre',
              message: 'Palier seuil 80 message',
              prescriberTitle: 'Palier seuil 80 titre prescripteur',
              prescriberDescription: 'Palier seuil 80 message prescripteur',
            },
          ];

          // when
          const collection = new StageCollectionUpdate({ stagesDTO, stageCollection });

          // then
          expect(collection).to.be.instanceOf(StageCollectionUpdate);
        });

        it('should successfully build the collection with a first skill stage', function () {
          // given
          const oldStages = [
            {
              id: 123,
              level: null,
              threshold: 0,
              title: 'Palier seuil 0 titre',
              message: 'Palier seuil 0 message',
              prescriberTitle: 'Palier seuil 0 titre prescripteur',
              prescriberDescription: 'Palier seuil 0 message prescripteur',
            },
            {
              id: 456,
              level: null,
              threshold: 50,
              title: 'Palier seuil 50 titre',
              message: 'Palier seuil 50 message',
              prescriberTitle: 'Palier seuil 50 titre prescripteur',
              prescriberDescription: 'Palier seuil 50 message prescripteur',
            },
            {
              id: 789,
              level: null,
              threshold: 60,
              title: 'Palier seuil 60 titre',
              message: 'Palier seuil 60 message',
              prescriberTitle: 'Palier seuil 60 titre prescripteur',
              prescriberDescription: 'Palier seuil 60 message prescripteur',
            },
          ];
          const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: oldStages,
            maxLevel: 8,
          });
          const stagesDTO = [
            {
              id: '123',
              level: null,
              threshold: 0,
              isFirstSkill: false,
              title: 'Palier seuil 0 titre',
              message: 'Palier seuil 0 message',
              prescriberTitle: 'Palier seuil 0 titre prescripteur',
              prescriberDescription: 'Palier seuil 0 message prescripteur',
            },
            {
              id: 456,
              level: null,
              threshold: 50,
              isFirstSkill: false,
              title: 'Palier seuil 50 titre',
              message: 'Palier seuil 50 message',
              prescriberTitle: 'Palier seuil 50 titre prescripteur',
              prescriberDescription: 'Palier seuil 50 message prescripteur',
            },
            {
              id: 789,
              level: null,
              threshold: 60,
              isFirstSkill: false,
              title: 'Palier seuil 60 titre',
              message: 'Palier seuil 60 message',
              prescriberTitle: 'Palier seuil 60 titre prescripteur',
              prescriberDescription: 'Palier seuil 60 message prescripteur',
            },
            {
              id: null,
              level: null,
              threshold: 80,
              isFirstSkill: false,
              title: 'Palier seuil 80 titre',
              message: 'Palier seuil 80 message',
              prescriberTitle: 'Palier seuil 80 prescripteur',
              prescriberDescription: 'Palier seuil 80 prescripteur',
            },
            {
              id: null,
              level: null,
              threshold: null,
              isFirstSkill: true,
              title: 'Palier premier acquis titre',
              message: 'Palier premier acquis message',
              prescriberTitle: 'Palier premier acquis prescripteur',
              prescriberDescription: 'Palier premier acquis prescripteur',
            },
          ];

          // when
          const collection = new StageCollectionUpdate({ stagesDTO, stageCollection });

          // then
          expect(collection).to.be.instanceOf(StageCollectionUpdate);
        });
      });
      context('when in a level collection', function () {
        it('should successfully build the collection', function () {
          // given
          const oldStages = [
            {
              id: 123,
              level: 0,
              threshold: null,
              title: 'Palier niveau 0 titre',
              message: 'Palier niveau 0 message',
              prescriberTitle: 'Palier niveau 0 titre prescripteur',
              prescriberDescription: 'Palier niveau 0 message prescripteur',
            },
            {
              id: 456,
              level: 1,
              threshold: null,
              title: 'Palier niveau 1 titre',
              message: 'Palier niveau 1 message',
              prescriberTitle: 'Palier niveau 1 titre prescripteur',
              prescriberDescription: 'Palier niveau 1 message prescripteur',
            },
            {
              id: 789,
              level: 2,
              threshold: null,
              title: 'Palier niveau 2 titre',
              message: 'Palier niveau 2 message',
              prescriberTitle: 'Palier niveau 2 titre prescripteur',
              prescriberDescription: 'Palier niveau 2 message prescripteur',
            },
          ];
          const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: oldStages,
            maxLevel: 8,
          });
          const stagesDTO = [
            {
              id: 123,
              level: 0,
              threshold: null,
              title: 'Palier niveau 0 titre',
              message: 'Palier niveau 0 message',
              prescriberTitle: 'Palier niveau 0 titre prescripteur',
              prescriberDescription: 'Palier niveau 0 message prescripteur',
            },
            {
              id: 456,
              level: 1,
              threshold: null,
              title: 'Palier niveau 1 titre',
              message: 'Palier niveau 1 message',
              prescriberTitle: 'Palier niveau 1 titre prescripteur',
              prescriberDescription: 'Palier niveau 1 message prescripteur',
            },
            {
              id: 789,
              level: 2,
              threshold: null,
              title: 'Palier niveau 2 titre',
              message: 'Palier niveau 2 message',
              prescriberTitle: 'Palier niveau 2 titre prescripteur',
              prescriberDescription: 'Palier niveau 2 message prescripteur',
            },
            {
              id: null,
              level: 3,
              threshold: null,
              title: 'Palier niveau 3 titre',
              message: 'Palier niveau 3 message',
              prescriberTitle: 'Palier niveau 3 titre prescripteur',
              prescriberDescription: 'Palier niveau 3 message prescripteur',
            },
          ];

          // when
          const collection = new StageCollectionUpdate({ stagesDTO, stageCollection });

          // then
          expect(collection).to.be.instanceOf(StageCollectionUpdate);
        });
        it('should successfully build the collection with a first skill stage', function () {
          // given
          const oldStages = [
            {
              id: 123,
              level: 0,
              threshold: null,
              title: 'Palier niveau 0 titre',
              message: 'Palier niveau 0 message',
              prescriberTitle: 'Palier niveau 0 titre prescripteur',
              prescriberDescription: 'Palier niveau 0 message prescripteur',
            },
            {
              id: 456,
              level: 1,
              threshold: null,
              title: 'Palier niveau 1 titre',
              message: 'Palier niveau 1 message',
              prescriberTitle: 'Palier niveau 1 titre prescripteur',
              prescriberDescription: 'Palier niveau 1 message prescripteur',
            },
            {
              id: 789,
              level: 2,
              threshold: null,
              title: 'Palier niveau 2 titre',
              message: 'Palier niveau 2 message',
              prescriberTitle: 'Palier niveau 2 titre prescripteur',
              prescriberDescription: 'Palier niveau 2 message prescripteur',
            },
          ];
          const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: oldStages,
            maxLevel: 8,
          });
          const stagesDTO = [
            {
              id: 123,
              level: 0,
              threshold: null,
              title: 'Palier niveau 0 titre',
              message: 'Palier niveau 0 message',
              prescriberTitle: 'Palier niveau 0 titre prescripteur',
              prescriberDescription: 'Palier niveau 0 message prescripteur',
            },
            {
              id: 456,
              level: 1,
              threshold: null,
              title: 'Palier niveau 1 titre',
              message: 'Palier niveau 1 message',
              prescriberTitle: 'Palier niveau 1 titre prescripteur',
              prescriberDescription: 'Palier niveau 1 message prescripteur',
            },
            {
              id: 789,
              level: 2,
              threshold: null,
              title: 'Palier niveau 2 titre',
              message: 'Palier niveau 2 message',
              prescriberTitle: 'Palier niveau 2 titre prescripteur',
              prescriberDescription: 'Palier niveau 2 message prescripteur',
            },
            {
              id: null,
              level: 3,
              threshold: null,
              isFirstSkill: false,
              title: 'Palier niveau 3 titre',
              message: 'Palier niveau 3 message',
              prescriberTitle: 'Palier niveau 3 titre prescripteur',
              prescriberDescription: 'Palier niveau 3 message prescripteur',
            },
            {
              id: null,
              level: null,
              threshold: null,
              isFirstSkill: true,
              title: 'Palier premier acquis titre',
              message: 'Palier premier acquis message',
              prescriberTitle: 'Palier premier acquis titre prescripteur',
              prescriberDescription: 'Palier premier acquis message prescripteur',
            },
          ];

          // when
          const collection = new StageCollectionUpdate({ stagesDTO, stageCollection });

          // then
          expect(collection).to.be.instanceOf(StageCollectionUpdate);
        });
      });
      it('should successfully build an empty collection', function () {
        // given
        const oldStages = [
          {
            id: 123,
            level: 0,
            threshold: null,
            title: 'Palier niveau 0 titre',
            message: 'Palier niveau 0 message',
            prescriberTitle: 'Palier niveau 0 titre prescripteur',
            prescriberDescription: 'Palier niveau 0 message prescripteur',
          },
          {
            id: 456,
            level: 1,
            threshold: null,
            title: 'Palier niveau 1 titre',
            message: 'Palier niveau 1 message',
            prescriberTitle: 'Palier niveau 1 titre prescripteur',
            prescriberDescription: 'Palier niveau 1 message prescripteur',
          },
          {
            id: 789,
            level: 2,
            threshold: null,
            title: 'Palier niveau 2 titre',
            message: 'Palier niveau 2 message',
            prescriberTitle: 'Palier niveau 2 titre prescripteur',
            prescriberDescription: 'Palier niveau 2 message prescripteur',
          },
        ];
        const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
          stages: oldStages,
          maxLevel: 8,
        });
        const stagesDTO = [];

        // when
        const collection = new StageCollectionUpdate({ stagesDTO, stageCollection });

        // then
        expect(collection).to.be.instanceOf(StageCollectionUpdate);
      });
    });
  });
});
