const { expect, airtableBuilder, domainBuilder, catchErr } = require('../../../../test-helper');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');
const InfoChallenge = require('../../../../../lib/domain/read-models/godmode/InfoChallenge');
const Challenge = require('../../../../../lib/domain/models/Challenge');
const infoChallengeRepository = require('../../../../../lib/infrastructure/repositories/godmode/info-challenge-repository');
const { NotFoundError } = require('../../../../../lib/domain/errors');

describe('Integration | Repository | info-challenge-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {
    it('should return the info challenge when it exists', async () => {
      // given
      const area1 = domainBuilder.buildArea({ id: 'recArea1Id', name: 'recArea1Name' });
      const area2 = domainBuilder.buildArea({ id: 'recArea2Id', name: 'recArea2Name' });
      const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1Id', name: 'recCompetence1Name', area: area1 });
      const competence2 = domainBuilder.buildCompetence({ id: 'recCompetence2Id', name: 'recCompetence2Name', area: area2 });
      const tube1 = domainBuilder.buildTube({ id: 'recTube1Id', name: 'recTube1Name', competenceId: competence1.id });
      const tube2 = domainBuilder.buildTube({ id: 'recTube2Id', name: 'recTube2Name', competenceId: competence2.id });
      const skill1 = domainBuilder.buildSkill({ id: 'recSkill1Id', name: 'recSkill1Name', pixValue: 1, tubeId: tube1.id, competenceId: competence1.id });
      const skill2 = domainBuilder.buildSkill({ id: 'recSkill2Id', name: 'recSkill2Name', pixValue: 2, tubeId: tube2.id, competenceId: competence2.id });
      const challenge = domainBuilder.buildChallenge({ id: 'recChallengeId', type: Challenge.Type.QROC, skills: [skill1, skill2], solution: 'The Cure\nThe Cure 2' });
      const otherChallenge = domainBuilder.buildChallenge({ skills: [skill1] });
      const airtableArea1 = airtableBuilder.factory.buildArea.fromDomain({ domainArea: area1 });
      const airtableArea2 = airtableBuilder.factory.buildArea.fromDomain({ domainArea: area2 });
      const airtableCompetence1 = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence1 });
      const airtableCompetence2 = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence2 });
      const airtableTube1 = airtableBuilder.factory.buildTube.fromDomain({ domainTube: tube1 });
      const airtableTube2 = airtableBuilder.factory.buildTube.fromDomain({ domainTube: tube2 });
      const airtableSkill1 = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill1, challengeIds: [challenge.id] });
      const airtableSkill2 = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill2, challengeIds: [challenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: challenge });
      const airtableOtherChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: otherChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableChallenge, airtableOtherChallenge],
        skills: [airtableSkill1, airtableSkill2],
        tubes: [airtableTube1, airtableTube2],
        competences: [airtableCompetence1, airtableCompetence2],
        areas: [airtableArea1, airtableArea2],
      });

      // when
      const actualInfoChallenge = await infoChallengeRepository.get('recChallengeId');

      // then
      expect(actualInfoChallenge).to.be.instanceOf(InfoChallenge);
      expect(actualInfoChallenge.id).to.equal('recChallengeId');
      expect(actualInfoChallenge.type).to.equal('QROC');
      expect(actualInfoChallenge.solution).to.equal('The Cure');
      expect(actualInfoChallenge.pixValue).to.equal(3);
      expect(actualInfoChallenge.skillIds).to.equal('recSkill1Id, recSkill2Id');
      expect(actualInfoChallenge.skillNames).to.equal('recSkill1Name, recSkill2Name');
      expect(actualInfoChallenge.tubeIds).to.equal('recTube1Id, recTube2Id');
      expect(actualInfoChallenge.tubeNames).to.equal('recTube1Name, recTube2Name');
      expect(actualInfoChallenge.competenceIds).to.equal('recCompetence1Id, recCompetence2Id');
      expect(actualInfoChallenge.competenceNames).to.equal('recCompetence1Name, recCompetence2Name');
      expect(actualInfoChallenge.areaIds).to.equal('recArea1Id, recArea2Id');
      expect(actualInfoChallenge.areaNames).to.equal('recArea1Name, recArea2Name');
    });

    it('should throw a NotFoundError when the challenge does not exist', async () => {
      // given
      const someChallenge = domainBuilder.buildChallenge({ id: 'recSomeChallengeId' });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: someChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableChallenge],
      });

      // when
      const error = await catchErr(infoChallengeRepository.get)('IDONTEXIST');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
