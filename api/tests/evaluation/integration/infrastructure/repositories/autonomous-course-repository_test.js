import { databaseBuilder, expect, mockLearningContent, sinon } from '../../../../test-helper.js';
import { repositories } from '../../../../../src/evaluation/infrastructure/repositories/index.js';
import { constants } from '../../../../../lib/domain/constants.js';
import { AutonomousCourse } from '../../../../../src/evaluation/domain/models/AutonomousCourse.js';

describe('Integration | Repository | Autonomous Course', function () {
  it('#save', async function () {
    // given
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({
      id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
    });
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

    await databaseBuilder.commit();

    // when
    const savedAutonomousCourseId = await repositories.autonomousCourseRepository.save({
      autonomousCourse: {
        ownerId: userId,
        organizationId,
        targetProfileId,
        publicTitle: 'public title',
        internalTitle: 'internal title',
        customLandingPageText: 'custom landing text page text',
      },
    });

    // then
    expect(savedAutonomousCourseId).to.be.above(0);
  });

  describe('#get', function () {
    context('when autonomous courses exists', function () {
      it('should return an autonomous course', async function () {
        // given
        const skillId = 'recArea1_Competence1_Tube1_Skill1';
        const learningContent = {
          skills: [
            {
              id: skillId,
              name: '@recArea1_Competence1_Tube1_Skill1',
              status: 'actif',
              tubeId: 'recArea1_Competence1_Tube1',
              competenceId: 'recArea1_Competence1',
            },
          ],
        };
        mockLearningContent(learningContent);
        sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        });
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
          isPublic: false,
          ownerOrganizationId: organizationId,
          isSimplifiedAccess: true,
        });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: autonomousCourseId } = databaseBuilder.factory.buildCampaign({
          name: 'Nom interne parcours autonome',
          title: 'Nom externe parcours autonome',
          code: 'PARCOURS1',
          type: 'ASSESSMENT',
          organizationId: organizationId,
          ownerId: userId,
          targetProfileId: targetProfileId,
          customLandingPageText: "un texte de page d'accueil",
          createdAt: new Date('2020-01-02'),
        });
        await databaseBuilder.commit();

        const expectedResult = {
          id: autonomousCourseId,
          internalTitle: 'Nom interne parcours autonome',
          publicTitle: 'Nom externe parcours autonome',
          customLandingPageText: "un texte de page d'accueil",
          createdAt: new Date('2020-01-02'),
          code: 'PARCOURS1',
        };

        // when
        const autonomousCourse = await repositories.autonomousCourseRepository.get({ autonomousCourseId });

        // then
        expect(autonomousCourse).to.be.instanceOf(AutonomousCourse);
        expect(autonomousCourse).to.deep.equal(expectedResult);
      });
    });
  });
});
