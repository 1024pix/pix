const { expect, domainBuilder, catchErrSync } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { InvalidStageError } = require('../../../../lib/domain/errors');

describe('Unit | UseCases | update-stage', function () {
  let stageCollection;

  context('When stage collection has level type stages', function () {
    beforeEach(function () {
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 51,
            level: 3,
            threshold: null,
            message: 'ancien message palier',
            title: 'ancien titre palier',
            prescriberDescription: 'ancienne description prescripteur palier',
            prescriberTitle: 'ancien titre prescripteur palier',
          },
        ],
        maxLevel: 5,
      });
    });

    it('should throw InvalidStageError for a level that is not a number', function () {
      // given
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 51,
            level: 3,
            threshold: null,
            message: 'ancien message palier',
            title: 'ancien titre palier',
            prescriberDescription: 'ancienne description prescripteur palier',
            prescriberTitle: 'ancien titre prescripteur palier',
          },
        ],
        maxLevel: 5,
      });
      const stageToUpdate = {
        id: 51,
        level: 'toto',
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level that is not an integer', function () {
      // given
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 51,
            level: 3,
            threshold: null,
            message: 'ancien message palier',
            title: 'ancien titre palier',
            prescriberDescription: 'ancienne description prescripteur palier',
            prescriberTitle: 'ancien titre prescripteur palier',
          },
        ],
        maxLevel: 5,
      });
      const stageToUpdate = {
        id: 51,
        level: 4.5,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level that exceed max level ', function () {
      // given
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 51,
            level: 3,
            threshold: null,
            message: 'ancien message palier',
            title: 'ancien titre palier',
            prescriberDescription: 'ancienne description prescripteur palier',
            prescriberTitle: 'ancien titre prescripteur palier',
          },
        ],
        maxLevel: 5,
      });
      const stageToUpdate = {
        id: 51,
        level: 88,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError when trying to update a stage that does not belong to collection', function () {
      // given
      const stageToUpdate = {
        id: 99,
        level: 2,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal("Palier non valide : Le palier 99 n'appartient pas à ce profil cible.");
    });

    it('should throw InvalidStageError if neither level nor threshold are given', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError if both level and threshold are given', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: 5,
        threshold: 85,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError when trying to add threshold stage', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 85,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau obligatoire.');
    });

    it('should throw InvalidStageError for a level that exceeds max level', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: 7,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level below 0', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: -1,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    context('title', function () {
      it('should throw InvalidStageError when not provided', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 4,
          threshold: null,
          message: 'nouveau message palier',
          title: null,
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
      });

      it('should throw InvalidStageError when empty', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 4,
          threshold: null,
          message: 'nouveau message palier',
          title: ' ',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
      });
    });

    context('message', function () {
      it('should throw InvalidStageError when not provided', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 4,
          threshold: null,
          message: null,
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Message obligatoire.');
      });

      it('should throw InvalidStageError when empty', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 4,
          threshold: null,
          message: ' ',
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Message obligatoire.');
      });
    });

    context('Multiple stage collection', function () {
      beforeEach(function () {
        stageCollection = domainBuilder.buildStageCollection({
          id: 100,
          stages: [
            {
              id: 50,
              level: 1,
              threshold: null,
              message: 'message palier',
              title: 'titre palier',
              prescriberDescription: 'description prescripteur palier',
              prescriberTitle: 'titre prescripteur palier',
            },
            {
              id: 51,
              level: 3,
              threshold: null,
              message: 'ancien message palier',
              title: 'ancien titre palier',
              prescriberDescription: 'ancienne description prescripteur palier',
              prescriberTitle: 'ancien titre prescripteur palier',
            },
          ],
          maxLevel: 5,
        });
      });

      it('should update the stage', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 4,
          threshold: null,
          message: 'nouveau message palier',
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const updatedStageCollection = usecases.updateStage({ stageCollection, stage: stageToUpdate });

        // then
        expect(updatedStageCollection.stages).to.deep.equal([
          {
            id: 50,
            level: 1,
            targetProfileId: 100,
            threshold: null,
            message: 'message palier',
            title: 'titre palier',
            prescriberDescription: 'description prescripteur palier',
            prescriberTitle: 'titre prescripteur palier',
          },
          {
            id: 51,
            targetProfileId: 100,
            level: 4,
            threshold: null,
            message: 'nouveau message palier',
            title: 'nouveau titre palier',
            prescriberDescription: 'nouvelle description prescripteur palier',
            prescriberTitle: 'nouveau titre prescripteur palier',
          },
        ]);
      });

      it('should throw InvalidStageError when level already taken', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: 1,
          threshold: null,
          message: 'nouveau message palier',
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Niveau déjà utilisé.');
      });
    });
  });

  context('When stage collection has threshold type stages', function () {
    beforeEach(function () {
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 51,
            level: null,
            threshold: 60,
            message: 'ancien message palier',
            title: 'ancien titre palier',
            prescriberDescription: 'ancienne description prescripteur palier',
            prescriberTitle: 'ancien titre prescripteur palier',
          },
        ],
        maxLevel: 5,
      });
    });

    it('should throw InvalidStageError when trying to update a stage that does not belong to collection', function () {
      // given
      const stageToUpdate = {
        id: 99,
        level: null,
        threshold: 85,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal("Palier non valide : Le palier 99 n'appartient pas à ce profil cible.");
    });

    it('should throw InvalidStageError if neither level nor threshold are given', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: null,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError if both level and threshold are given', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: 5,
        threshold: 85,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError for a threshold that is not a number', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 'toto',
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that is not an integer', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 40.5,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that exceeds 100', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 185,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold below 0', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: -1,
        message: 'nouveau message palier',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError when title not provided', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 33,
        message: 'nouveau message palier',
        title: null,
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
    });

    it('should throw InvalidStageError when empty title', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 33,
        message: 'nouveau message palier',
        title: ' ',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
    });

    it('should throw InvalidStageError when message not provided', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 33,
        message: null,
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Message obligatoire.');
    });

    it('should throw InvalidStageError when empty message', function () {
      // given
      const stageToUpdate = {
        id: 51,
        level: null,
        threshold: 33,
        message: ' ',
        title: 'nouveau titre palier',
        prescriberDescription: 'nouvelle description prescripteur palier',
        prescriberTitle: 'nouveau titre prescripteur palier',
      };

      // when
      const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Message obligatoire.');
    });

    context('Multiple stage collection', function () {
      beforeEach(function () {
        stageCollection = domainBuilder.buildStageCollection({
          id: 100,
          stages: [
            {
              id: 50,
              level: null,
              threshold: 45,
              message: 'message premier palier',
              title: 'titre premier palier',
              prescriberDescription: 'description prescripteur premier palier',
              prescriberTitle: 'titre descripteur premier palier',
            },
            {
              id: 51,
              level: null,
              threshold: 60,
              message: 'ancien message palier',
              title: 'ancien titre palier',
              prescriberDescription: 'ancienne description prescripteur palier',
              prescriberTitle: 'ancien titre prescripteur palier',
            },
          ],
          maxLevel: 5,
        });
      });

      it('should update the stage', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: null,
          threshold: 95,
          message: 'nouveau message palier',
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const updatedStageCollection = usecases.updateStage({ stageCollection, stage: stageToUpdate });

        // then
        expect(updatedStageCollection.stages).to.deep.equal([
          {
            id: 50,
            targetProfileId: 100,
            level: null,
            threshold: 45,
            message: 'message premier palier',
            title: 'titre premier palier',
            prescriberDescription: 'description prescripteur premier palier',
            prescriberTitle: 'titre descripteur premier palier',
          },
          {
            id: 51,
            targetProfileId: 100,
            level: null,
            threshold: 95,
            message: 'nouveau message palier',
            title: 'nouveau titre palier',
            prescriberDescription: 'nouvelle description prescripteur palier',
            prescriberTitle: 'nouveau titre prescripteur palier',
          },
        ]);
      });

      it('should throw InvalidStageError for threshold already taken', function () {
        // given
        const stageToUpdate = {
          id: 51,
          level: null,
          threshold: 45,
          message: 'nouveau message palier',
          title: 'nouveau titre palier',
          prescriberDescription: 'nouvelle description prescripteur palier',
          prescriberTitle: 'nouveau titre prescripteur palier',
        };

        // when
        const error = catchErrSync(usecases.updateStage)({ stageCollection, stage: stageToUpdate });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
        expect(error.message).to.equal('Palier non valide : Seuil déjà utilisé.');
      });
    });
  });
});
