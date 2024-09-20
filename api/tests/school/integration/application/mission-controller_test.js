import { missionController } from '../../../../src/school/application/mission-controller.js';
import { Mission } from '../../../../src/school/domain/models/Mission.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Integration | Controller | mission-controller', function () {
  describe('#getById', function () {
    it('should get mission by id', async function () {
      // given
      const mission = new Mission({
        name: 'TAG1',
        id: 1,
        areaCode: 1,
        learningObjectives: 'learningObjectives',
        validatedObjectives: 'validatedObjectives',
        introductionMediaUrl: 'http://monimage.pix.fr',
        introductionMediaType: 'image',
        introductionMediaAlt: "Alt à l'image",
        startedBy: '',
        documentationUrl: 'http://madoc.pix.fr',
      });
      sinon.stub(usecases, 'getMission').resolves(mission);

      // when
      const result = await missionController.getById(
        {
          params: {
            id: 'organizationId',
            missionId: mission.id,
          },
        },
        hFake,
      );

      // then
      expect(result.data).to.deep.equal({
        attributes: {
          name: mission.name,
          'area-code': mission.areaCode,
          'learning-objectives': mission.learningObjectives,
          'validated-objectives': mission.validatedObjectives,
          'competence-name': mission.competenceName,
          'introduction-media-url': mission.introductionMediaUrl,
          'introduction-media-type': mission.introductionMediaType,
          'introduction-media-alt': mission.introductionMediaAlt,
          'documentation-url': mission.documentationUrl,
          'started-by': '',
          content: {
            dareChallenges: [],
            steps: [
              {
                name: undefined,
                trainingChallenges: [],
                tutorialChallenges: [],
                validationChallenges: [],
              },
            ],
          },
        },
        id: `${mission.id}`,
        type: 'missions',
      });
      expect(usecases.getMission).to.have.been.calledWithExactly({
        organizationId: 'organizationId',
        missionId: mission.id,
      });
    });
  });

  describe('#findAllActive', function () {
    it('should find all active missions', async function () {
      // given
      const mission = new Mission({
        id: 1,
        name: 'TAG1',
        color: 'Green',
        startedBy: 'CM1',
        documentationUrl: 'http://madoc.pix.fr',
      });
      sinon.stub(usecases, 'findAllActiveMissions').resolves([mission]);

      // when
      const result = await missionController.findAllActive({ params: { id: 'organizationId' } }, hFake);

      // then
      expect(result.data).to.deep.equal([
        {
          attributes: {
            name: mission.name,
            'area-code': mission.areaCode,
            'learning-objectives': mission.learningObjectives,
            'validated-objectives': mission.validatedObjectives,
            'competence-name': mission.competenceName,
            'introduction-media-url': mission.introductionMediaUrl,
            'introduction-media-type': mission.introductionMediaType,
            'introduction-media-alt': mission.introductionMediaAlt,
            'documentation-url': mission.documentationUrl,
            'started-by': mission.startedBy,
            content: {
              dareChallenges: [],
              steps: [
                {
                  name: undefined,
                  trainingChallenges: [],
                  tutorialChallenges: [],
                  validationChallenges: [],
                },
              ],
            },
          },
          id: `${mission.id}`,
          type: 'missions',
        },
      ]);
    });
  });
});
