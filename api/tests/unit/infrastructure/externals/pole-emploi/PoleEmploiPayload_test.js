const PoleEmploiPayload = require('../../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload');
const { expect, domainBuilder } = require('../../../../test-helper');

describe('Unit | Infrastructure | Externals | Pole-Emploi | PoleEmploiPayload', () => {
  let user;
  let campaign;
  let targetProfile;
  let assessment;
  let participation;

  beforeEach(() => {
    user = domainBuilder.buildUser();
    targetProfile = domainBuilder.buildTargetProfile({ name: 'Diagnostic initial' });
    campaign = domainBuilder.buildCampaign.ofTypeAssessment({ targetProfileId: targetProfile.id });
    assessment = domainBuilder.buildAssessment({ userId: user.id });
    participation = domainBuilder.buildCampaignParticipation({ campaign, userId: user.id, assessmentId: assessment.id });
  });

  describe('buildForParticipationStarted', () => {

    it('should build individu payload for a campaign participation started', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.individu).to.deep.equal({
        nom: user.lastName,
        prenom: user.firstName,
      });
    });

    it('should build campagne payload for a campaign participation started', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.campagne).to.deep.equal({
        nom: campaign.name,
        dateDebut: campaign.createdAt,
        dateFin: campaign.archivedAt,
        type: 'EVALUATION',
        codeCampagne: campaign.code,
        urlCampagne: `https://app.pix.fr/campagnes/${campaign.code}`,
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      });
    });

    it('should build test payload for a campaign participation started', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.test).to.deep.equal({
        etat: 2,
        progression: 0,
        typeTest: 'DI',
        referenceExterne: participation.id,
        dateDebut: participation.createdAt,
        dateProgression: null,
        dateValidation: null,
        evaluation: null,
        uniteEvaluation: 'A',
        elementsEvalues: [],
      });
    });
  });

  describe('buildForParticipationFinished', () => {

    it('should build individu payload for a campaign participation finished', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationFinished({
        user,
        campaign,
        participation,
        targetProfile,
        assessment,
      });

      // then
      expect(payload.individu).to.deep.equal({
        nom: user.lastName,
        prenom: user.firstName,
      });
    });

    it('should build campagne payload for a campaign participation finished', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationFinished({
        user,
        campaign,
        participation,
        targetProfile,
        assessment,
      });

      // then
      expect(payload.campagne).to.deep.equal({
        nom: campaign.name,
        dateDebut: campaign.createdAt,
        dateFin: campaign.archivedAt,
        type: 'EVALUATION',
        codeCampagne: campaign.code,
        urlCampagne: `https://app.pix.fr/campagnes/${campaign.code}`,
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      });
    });

    it('should build test payload for a campaign participation finished', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationFinished({
        user,
        campaign,
        participation,
        targetProfile,
        assessment,
      });

      // then
      expect(payload.test).to.deep.equal({
        etat: 3,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: participation.id,
        dateDebut: participation.createdAt,
        dateProgression: assessment.updatedAt,
        dateValidation: null,
        evaluation: null,
        uniteEvaluation: 'A',
        elementsEvalues: [],
      });
    });
  });

  describe('buildForParticipationShared', () => {

    it('should build individu payload for a campaign participation shared', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationShared({
        user,
        campaign,
        participation,
        targetProfile,
        participationResult: {},
      });

      // then
      expect(payload.individu).to.deep.equal({
        nom: user.lastName,
        prenom: user.firstName,
      });
    });

    it('should build campagne payload for a campaign participation shared', () => {
      // when
      const payload = PoleEmploiPayload.buildForParticipationShared({
        user,
        campaign,
        participation,
        targetProfile,
        participationResult: {},
      });

      // then
      expect(payload.campagne).to.deep.equal({
        nom: campaign.name,
        dateDebut: campaign.createdAt,
        dateFin: campaign.archivedAt,
        type: 'EVALUATION',
        codeCampagne: campaign.code,
        urlCampagne: `https://app.pix.fr/campagnes/${campaign.code}`,
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      });
    });

    it('should build test payload for a campaign participation shared', () => {
      // given
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

      // when
      const payload = PoleEmploiPayload.buildForParticipationShared({
        user,
        campaign,
        participation,
        targetProfile,
        participationResult,
      });

      // then
      expect(payload.test).to.deep.equal({
        etat: 4,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: participation.id,
        dateDebut: participation.createdAt,
        dateProgression: participation.sharedAt,
        dateValidation: participation.sharedAt,
        evaluation: 70,
        uniteEvaluation: 'A',
        elementsEvalues: [{
          libelle: 'Gérer des données',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 4,
          evaluation: {
            scoreObtenu: 50,
            uniteScore: 'A',
            nbSousElementValide: 2,
          },
        }],
      });
    });
  });

  describe('map different test types in the payload', () => {

    it('should map test type with target profile name "Diagnostic initial"', () => {
      // given
      targetProfile = domainBuilder.buildTargetProfile({ name: 'Diagnostic initial' });

      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.test.typeTest).equal('DI');
    });

    it('should map test type with target profile name "Parcours complet"', () => {
      // given
      targetProfile = domainBuilder.buildTargetProfile({ name: 'Parcours complet' });

      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.test.typeTest).equal('PC');
    });

    it('should map test type with other target profile names ', () => {
      // given
      targetProfile = domainBuilder.buildTargetProfile({ name: 'Other' });

      // when
      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        participation,
        targetProfile,
      });

      // then
      expect(payload.test.typeTest).equal('CP');
    });
  });
});
