const PoleEmploiPayload = require('../../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload');
const EnvoiDoc = require('../../../../../lib/infrastructure/open-api-doc/pole-emploi/envois-doc');
const { expect, domainBuilder } = require('../../../../test-helper');

describe('Unit | Infrastructure | Open API Doc | Pole Emploi | Envois Documentation', () => {
  it('should validate payload for a campaign participation', () => {
    // given
    const user = domainBuilder.buildUser();
    const targetProfile = domainBuilder.buildTargetProfile({ name: 'Diagnostic initial' });
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ targetProfileId: targetProfile.id });
    const assessment = domainBuilder.buildAssessment({ userId: user.id });
    const participation = domainBuilder.buildCampaignParticipation({
      campaign,
      userId: user.id,
      assessmentId: assessment.id,
    });
    const participationResult = domainBuilder.buildCampaignParticipationResult({
      totalSkillsCount: 10,
      validatedSkillsCount: 7,
      competenceResults: [
        domainBuilder.buildCompetenceResult({
          name: 'Gérer des données',
          areaName: 'Information et données',
          totalSkillsCount: 4,
          testedSkillsCount: 2,
          validatedSkillsCount: 2,
        }),
      ],
    });

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      participation,
      targetProfile,
      participationResult,
    });

    // when
    const result = EnvoiDoc.validate([{ idEnvoi: '1', dateEnvoi: '2020-11-31T12:00:38.133Z', resultat: payload }]);

    // then
    expect(result.error).to.be.undefined;
  });
});
