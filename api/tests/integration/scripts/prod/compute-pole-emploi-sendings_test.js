const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, knex, learningContentBuilder, mockLearningContent, sinon } = require('../../../test-helper');
const computePoleEmploiSendings = require('../../../../scripts/prod/compute-pole-emploi-sendings');
const Campaign = require('../../../../lib/domain/models/Campaign');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');

function setLearningContent(learningContent) {
  const learningObjects = learningContentBuilder.buildLearningContent(learningContent);
  mockLearningContent(learningObjects);
}

describe('computePoleEmploiSendings', () => {

  const code = 'CODEPE123';
  let campaignParticipationId, userId, campaignId;
  let skill1, skill2, competence1, competence2;

  beforeEach(() => {
    sinon.stub(console, 'log');

    skill1 = domainBuilder.buildSkill({ id: 'skill1Id' }); // skill invalidated in assessment
    skill2 = domainBuilder.buildSkill({ id: 'skill2Id' }); // skill validated in assessment
    competence1 = domainBuilder.buildCompetence({ id: 'competence1Id', name: 'Competence 1', skillIds: [skill1.id] });
    competence2 = domainBuilder.buildCompetence({ id: 'competence2Id', name: 'Competence 2', skillIds: [skill2.id] });
    const learningContent = [{
      id: 'areaId',
      name: 'Area',
      competences: [
        {
          id: competence1.id,
          name: competence1.name,
          tubes: [{
            id: 'tube1Id',
            skills: [
              { id: skill1.id, nom: '@web1' },
            ],
          }],
        },
        {
          id: competence2.id,
          name: competence2.name,
          tubes: [{
            id: 'tube2Id',
            skills: [
              { id: skill2.id, nom: '@file1' },
            ],
          }],
        },
      ],
    }];
    setLearningContent(learningContent);

    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const tagId = databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id;
    databaseBuilder.factory.buildOrganizationTag({ tagId, organizationId });
    const targetProfileId = databaseBuilder.factory.buildTargetProfile({ name: 'Diagnostic initial' }).id;
    [skill1, skill2].forEach((skill) => databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill.id }));
    campaignId = databaseBuilder.factory.buildCampaign({ name: 'Campagne Pôle Emploi', code, type: Campaign.types.ASSESSMENT, organizationId, targetProfileId }).id;
    userId = databaseBuilder.factory.buildUser({ firstName: 'Martin', lastName: 'Tamare' }).id;
    return databaseBuilder.commit();
  });

  afterEach(() => {
    return knex('pole-emploi-sendings').delete();
  });

  context('when pole emploi sendings is missing for status CAMPAIGN_PARTICIPATION_START', () => {
    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: false, sharedAt: null }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'started', type: 'CAMPAIGN' });
      return databaseBuilder.commit();
    });

    it('should create pole emploi sending', async () => {
      const payload = {
        campagne: {
          nom: 'Campagne Pôle Emploi',
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateFin: null,
          type: 'EVALUATION',
          codeCampagne: 'CODEPE123',
          urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
          nomOrganisme: 'Pix',
          typeOrganisme: 'externe',
        },
        individu: {
          nom: 'Tamare',
          prenom: 'Martin',
        },
        test: {
          etat: 2,
          progression: 0,
          typeTest: 'DI',
          referenceExterne: campaignParticipationId,
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateProgression: null,
          dateValidation: null,
          evaluation: null,
          uniteEvaluation: 'A',
          elementsEvalues: [],
        },
      };
      const expectedResults = {
        campaignParticipationId,
        type: 'CAMPAIGN_PARTICIPATION_START',
        isSuccessful: false,
        responseCode: 'NOT_SENT',
        payload,
      };

      await computePoleEmploiSendings(code, 1);

      const [ poleEmploiSending ] = await knex('pole-emploi-sendings').where({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START });
      expect(_.omit(poleEmploiSending, ['id', 'createdAt'])).to.deep.equal(expectedResults);
    });
  });

  context('when pole emploi sendings is missing for status CAMPAIGN_PARTICIPATION_COMPLETION', () => {
    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: false, sharedAt: null }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN' });
      return databaseBuilder.commit();
    });

    it('should create pole emploi sending', async () => {
      const payload = {
        campagne: {
          nom: 'Campagne Pôle Emploi',
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateFin: null,
          type: 'EVALUATION',
          codeCampagne: 'CODEPE123',
          urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
          nomOrganisme: 'Pix',
          typeOrganisme: 'externe',
        },
        individu: {
          nom: 'Tamare',
          prenom: 'Martin',
        },
        test: {
          etat: 3,
          progression: 100,
          typeTest: 'DI',
          referenceExterne: campaignParticipationId,
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateProgression: '2020-01-02T00:00:00.000Z',
          dateValidation: null,
          evaluation: null,
          uniteEvaluation: 'A',
          elementsEvalues: [],
        },
      };
      const expectedResults = {
        campaignParticipationId,
        type: 'CAMPAIGN_PARTICIPATION_COMPLETION',
        isSuccessful: false,
        responseCode: 'NOT_SENT',
        payload,
      };

      await computePoleEmploiSendings(code, 1);

      const [ poleEmploiSending ] = await knex('pole-emploi-sendings').where({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION });
      expect(_.omit(poleEmploiSending, ['id', 'createdAt'])).to.deep.equal(expectedResults);
    });
  });

  context('when pole emploi sendings is missing for status CAMPAIGN_PARTICIPATION_COMPLETION and assessment has been improved', () => {
    let oldAssessment, assessmentImproving;

    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: false, sharedAt: null }).id;
      oldAssessment = databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN', updatedAt: new Date('2020-10-10') });
      assessmentImproving = databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN', updatedAt: new Date('2020-12-12'), isImproving: true });
      return databaseBuilder.commit();
    });

    it('should create pole emploi sending', async () => {
      await computePoleEmploiSendings(code, 1);

      const poleEmploiSendings = await knex('pole-emploi-sendings').where({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION });
      expect(poleEmploiSendings).to.have.lengthOf(2);
      expect(_.map(poleEmploiSendings, 'payload.test.dateProgression')).to.have.members([oldAssessment.updatedAt.toISOString(), assessmentImproving.updatedAt.toISOString()]);
    });
  });

  context('when pole emploi sendings is missing for status CAMPAIGN_PARTICIPATION_SHARING', () => {
    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2021-10-10') }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN' }).id;
      const ke1 = databaseBuilder.factory.buildKnowledgeElement({ status: 'validated', skillId: skill1.id, assessmentId, userId, competenceId: competence1.id });
      const ke2 = databaseBuilder.factory.buildKnowledgeElement({ status: 'invalidated', skillId: skill2.id, assessmentId, userId, competenceId: competence1.id });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt: new Date('2021-10-10'), snapshot: JSON.stringify([ke1, ke2]) });
      return databaseBuilder.commit();
    });

    it('should create pole emploi sending', async () => {
      // given
      const payload = {
        campagne: {
          nom: 'Campagne Pôle Emploi',
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateFin: null,
          type: 'EVALUATION',
          codeCampagne: 'CODEPE123',
          urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
          nomOrganisme: 'Pix',
          typeOrganisme: 'externe',
        },
        individu: {
          nom: 'Tamare',
          prenom: 'Martin',
        },
        test: {
          etat: 4,
          progression: 100,
          typeTest: 'DI',
          referenceExterne: campaignParticipationId,
          dateDebut: '2020-01-01T00:00:00.000Z',
          dateProgression: '2021-10-10T00:00:00.000Z',
          dateValidation: '2021-10-10T00:00:00.000Z',
          evaluation: 50,
          uniteEvaluation: 'A',
          elementsEvalues: [{
            libelle: 'Competence 1',
            categorie: 'competence',
            type: 'competence Pix',
            domaineRattachement: 'Area',
            nbSousElements: 1,
            evaluation: {
              scoreObtenu: 100,
              uniteScore: 'A',
              nbSousElementValide: 1,
            },
          }, {
            libelle: 'Competence 2',
            categorie: 'competence',
            type: 'competence Pix',
            domaineRattachement: 'Area',
            nbSousElements: 1,
            evaluation: {
              scoreObtenu: 0,
              uniteScore: 'A',
              nbSousElementValide: 0,
            },
          }],
        },
      };
      const expectedResults = {
        campaignParticipationId,
        type: 'CAMPAIGN_PARTICIPATION_SHARING',
        isSuccessful: false,
        responseCode: 'NOT_SENT',
        payload,
      };

      // when
      await computePoleEmploiSendings(code, 1);

      // then
      const [ poleEmploiSending ] = await knex('pole-emploi-sendings').where({ type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING });
      expect(_.omit(poleEmploiSending, ['id', 'createdAt'])).to.deep.equal(expectedResults);
    });
  });

  context('when pole emploi sendings is missing for all statuses', () => {
    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2021-10-10') }).id;
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN' });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt: new Date('2021-10-10'), snapshot: JSON.stringify([]) });
      return databaseBuilder.commit();
    });

    it('should create 3 pole emploi sendings', async () => {
      await computePoleEmploiSendings(code, 1);

      const poleEmploiSendings = await knex('pole-emploi-sendings');
      expect(poleEmploiSendings).to.have.lengthOf(3);
    });
  });

  context('when only one pole emploi sendings is missing', () => {
    beforeEach(() => {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2021-10-10') }).id;
      databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId, type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START });
      databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId, type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION });
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, state: 'completed', type: 'CAMPAIGN' });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt: new Date('2021-10-10'), snapshot: JSON.stringify([]) });
      return databaseBuilder.commit();
    });

    it('should only create pole emploi sending missing', async () => {
      await computePoleEmploiSendings(code, 1);

      const poleEmploiSendings = await knex('pole-emploi-sendings');
      expect(poleEmploiSendings).to.have.lengthOf(3);
    });
  });
});
