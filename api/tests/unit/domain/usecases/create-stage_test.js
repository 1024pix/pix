const { expect, domainBuilder, catchErrSync } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { InvalidStageError } = require('../../../../lib/domain/errors');

describe('Unit | UseCases | create-stage', function () {
  let stageCollection;

  context('When stage collection is empty', function () {
    beforeEach(function () {
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [],
        maxLevel: 2,
      });
    });

    it('should throw InvalidStageError if neither level nor threshold are given', function () {
      // given
      const stage = { level: null, threshold: null, title: 'title', message: 'message' };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError if both level and threshold are given', function () {
      // given
      const stage = { level: 2, threshold: 75, title: 'title', message: 'message' };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil ou niveau obligatoire.');
    });

    it('should throw InvalidStageError for a level that is not a number', function () {
      // given
      const stageWithLevel = {
        level: 5,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 2.');
    });

    it('should throw InvalidStageError for a level that is not an integer', function () {
      // given
      const stageWithLevel = {
        level: 3.5,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 2.');
    });

    it('should throw InvalidStageError for a level that exceeds max level', function () {
      // given
      const stageWithLevel = {
        level: 5,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 2.');
    });

    it('should throw InvalidStageError for a level below 0', function () {
      // given
      const stageWithLevel = {
        level: -1,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 2.');
    });

    it('should throw InvalidStageError for a threshold that is not  number', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 'toto',
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that is not an integer', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 101.5,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that exceeds 100', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 101,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold below 0', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: -1,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError when title not provided', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 50,
        title: null,
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
    });

    it('should throw InvalidStageError when message not provided', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 50,
        title: 'title',
        message: '',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Message obligatoire.');
    });

    it('should create a stage by level', function () {
      // given
      const stageWithLevel = {
        level: 0,
        threshold: null,
        message: 'message nouveau palier',
        title: 'titre nouveau palier',
        prescriberDescription: 'ignored',
        prescriberTitle: 'ignored',
      };

      // when
      const updatedStageCollection = usecases.createStage({ stageCollection, stage: stageWithLevel });

      // then
      expect(updatedStageCollection.stages).to.deep.equal([
        {
          id: undefined,
          targetProfileId: 100,
          level: 0,
          threshold: null,
          message: 'message nouveau palier',
          title: 'titre nouveau palier',
          prescriberDescription: null,
          prescriberTitle: null,
        },
      ]);
    });

    it('should create a stage by threshold', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 0,
        message: 'message nouveau palier',
        title: 'titre nouveau palier',
        prescriberDescription: 'ignored',
        prescriberTitle: 'ignored',
      };

      // when
      const updatedStageCollection = usecases.createStage({ stageCollection, stage: stageWithThreshold });

      // then
      expect(updatedStageCollection.stages).to.deep.equal([
        {
          id: undefined,
          targetProfileId: 100,
          level: null,
          threshold: 0,
          message: 'message nouveau palier',
          title: 'titre nouveau palier',
          prescriberDescription: null,
          prescriberTitle: null,
        },
      ]);
    });
  });

  context('When stage collection has level type stages', function () {
    beforeEach(function () {
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 50,
            level: 1,
            threshold: null,
            message: 'message premier palier',
            title: 'titre premier palier',
            prescriberDescription: 'description prescripteur premier palier',
            prescriberTitle: 'titre descripteur premier palier',
          },
        ],
        maxLevel: 5,
      });
    });

    it('should create a stage by level', function () {
      // given
      const stageWithLevel = {
        level: 2,
        threshold: null,
        message: 'message nouveau palier',
        title: 'titre nouveau palier',
        prescriberDescription: 'ignored',
        prescriberTitle: 'ignored',
      };

      // when
      const updatedStageCollection = usecases.createStage({ stageCollection, stage: stageWithLevel });

      // then
      expect(updatedStageCollection.stages).to.deep.equal([
        {
          id: 50,
          targetProfileId: 100,
          level: 1,
          threshold: null,
          message: 'message premier palier',
          title: 'titre premier palier',
          prescriberDescription: 'description prescripteur premier palier',
          prescriberTitle: 'titre descripteur premier palier',
        },
        {
          id: undefined,
          targetProfileId: 100,
          level: 2,
          threshold: null,
          message: 'message nouveau palier',
          title: 'titre nouveau palier',
          prescriberDescription: null,
          prescriberTitle: null,
        },
      ]);
    });

    it('should throw InvalidStageError when trying to add threshold stage', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 20,
        message: 'message',
        title: 'titre',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau obligatoire.');
    });

    it('should throw InvalidStageError for a level that is not a number', function () {
      // given
      const stageWithLevel = {
        level: 'toto',
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level that is not an integer', function () {
      // given
      const stageWithLevel = {
        level: 4.5,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level that exceeds max level', function () {
      // given
      const stageWithLevel = {
        level: 7,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError for a level below 0', function () {
      // given
      const stageWithLevel = {
        level: -1,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau doit être compris entre 0 et 5.');
    });

    it('should throw InvalidStageError when level already taken', function () {
      // given
      const stageWithLevel = {
        level: 1,
        threshold: null,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Niveau déjà utilisé.');
    });

    it('should throw InvalidStageError when title not provided', function () {
      // given
      const stageWithLevel = {
        level: 4,
        threshold: null,
        title: null,
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
    });

    it('should throw InvalidStageError when message not provided', function () {
      // given
      const stageWithLevel = {
        level: 4,
        threshold: null,
        title: 'title',
        message: '',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Message obligatoire.');
    });
  });

  context('When stage collection has threshold type stages', function () {
    beforeEach(function () {
      stageCollection = domainBuilder.buildStageCollection({
        id: 100,
        stages: [
          {
            id: 50,
            level: null,
            threshold: 50,
            message: 'message premier palier',
            title: 'titre premier palier',
            prescriberDescription: 'description prescripteur premier palier',
            prescriberTitle: 'titre descripteur premier palier',
          },
        ],
        maxLevel: 5,
      });
    });

    it('should create a stage by threshold', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 60,
        message: 'message nouveau palier',
        title: 'titre nouveau palier',
        prescriberDescription: 'ignored',
        prescriberTitle: 'ignored',
      };

      // when
      const updatedStageCollection = usecases.createStage({ stageCollection, stage: stageWithThreshold });

      // then
      expect(updatedStageCollection.stages).to.deep.equal([
        {
          id: 50,
          targetProfileId: 100,
          level: null,
          threshold: 50,
          message: 'message premier palier',
          title: 'titre premier palier',
          prescriberDescription: 'description prescripteur premier palier',
          prescriberTitle: 'titre descripteur premier palier',
        },
        {
          id: undefined,
          targetProfileId: 100,
          level: null,
          threshold: 60,
          message: 'message nouveau palier',
          title: 'titre nouveau palier',
          prescriberDescription: null,
          prescriberTitle: null,
        },
      ]);
    });

    it('should throw InvalidStageError when trying to add level stage', function () {
      // given
      const stageWithLevel = {
        level: 2,
        threshold: null,
        message: 'message',
        title: 'title',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil obligatoire.');
    });

    it('should throw InvalidStageError for a threshold that is not a number', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 'toto',
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that is not an integer', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 40.5,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold that exceeds 100', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 101,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for a threshold below 0', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: -1,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil doit être compris entre 0 et 100.');
    });

    it('should throw InvalidStageError for threshold already taken', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 50,
        title: 'title',
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Seuil déjà utilisé.');
    });

    it('should throw InvalidStageError when title not provided', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 65,
        title: null,
        message: 'message',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Titre obligatoire.');
    });

    it('should throw InvalidStageError when message not provided', function () {
      // given
      const stageWithThreshold = {
        level: null,
        threshold: 65,
        title: 'title',
        message: '',
      };

      // when
      const error = catchErrSync(usecases.createStage)({ stageCollection, stage: stageWithThreshold });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
      expect(error.message).to.equal('Palier non valide : Message obligatoire.');
    });
  });
});
