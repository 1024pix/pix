const { expect, domainBuilder } = require('../../../../../test-helper');
const infoChallengeSerializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/godmode/info-challenge-serializer');
const Challenge = require('../../../../../../lib/domain/models/Challenge');

describe('Unit | Serializer | JSONAPI | info-challenge-serializer', () => {

  describe('#serialize()', () => {

    it('should convert a InfoChallenge model object into JSON API data', () => {
      // given
      const infoChallenge = domainBuilder.buildInfoChallenge({
        id: 'recChallengeId',
        type: Challenge.Type.QROCM_DEP,
        solution: 'The Cure',
        pixValue: 456,
        skillIds: 'someSkillIds',
        skillNames: 'someSkillNames',
        tubeIds: 'someTubeIds',
        tubeNames: 'someTubeNames',
        competenceIds: 'someCompetenceIds',
        competenceNames: 'someCompetenceNames',
        areaIds: 'someAreaIds',
        areaNames: 'someAreaNames',
      });

      // when
      const jsonApi = infoChallengeSerializer.serialize(infoChallenge);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'info-challenges',
          id: infoChallenge.id.toString(),
          attributes: {
            'type': infoChallenge.type,
            'solution': infoChallenge.solution,
            'pix-value': infoChallenge.pixValue,
            'skill-ids': infoChallenge.skillIds,
            'skill-names': infoChallenge.skillNames,
            'tube-ids': infoChallenge.tubeIds,
            'tube-names': infoChallenge.tubeNames,
            'competence-ids': infoChallenge.competenceIds,
            'competence-names': infoChallenge.competenceNames,
            'area-ids': infoChallenge.areaIds,
            'area-names': infoChallenge.areaNames,
          },
        },
      });
    });
  });
});
