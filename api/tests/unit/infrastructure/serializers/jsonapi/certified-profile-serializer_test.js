import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certified-profile-serializer';

describe('Unit | Serializer | JSONAPI | certified-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a certified profile to JSONAPI', function () {
      // given
      const skill1 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill1',
        name: 'skill_1',
        hasBeenAskedInCertif: false,
        tubeId: 'recTube1',
        difficulty: 1,
      });
      const skill2 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill2',
        name: 'skill_2',
        hasBeenAskedInCertif: true,
        tubeId: 'recTube1',
        difficulty: 2,
      });
      const tube1 = domainBuilder.buildCertifiedTube({
        id: 'recTube1',
        name: 'tube_1',
        competenceId: 'recCompetence1',
      });
      const competence1 = domainBuilder.buildCertifiedCompetence({
        id: 'recCompetence1',
        name: 'competence_1',
        areaId: 'recArea1',
        origin: 'Pix',
      });
      const area1 = domainBuilder.buildCertifiedArea({
        id: 'recArea1',
        name: 'area_1',
        color: 'someColor',
      });
      const certifiedProfile = domainBuilder.buildCertifiedProfile({
        id: 123,
        userId: 456,
        certifiedSkills: [skill1, skill2],
        certifiedTubes: [tube1],
        certifiedCompetences: [competence1],
        certifiedAreas: [area1],
      });

      const expectedCertifiedProfileSerialized = {
        data: {
          id: '123',
          type: 'certified-profiles',
          attributes: {
            'user-id': 456,
          },
          relationships: {
            'certified-skills': {
              data: [
                {
                  id: 'recSkill1',
                  type: 'certified-skills',
                },
                {
                  id: 'recSkill2',
                  type: 'certified-skills',
                },
              ],
            },
            'certified-tubes': {
              data: [
                {
                  id: 'recTube1',
                  type: 'certified-tubes',
                },
              ],
            },
            'certified-competences': {
              data: [
                {
                  id: 'recCompetence1',
                  type: 'certified-competences',
                },
              ],
            },
            'certified-areas': {
              data: [
                {
                  id: 'recArea1',
                  type: 'certified-areas',
                },
              ],
            },
          },
        },
        included: [
          {
            id: 'recSkill1',
            type: 'certified-skills',
            attributes: {
              name: 'skill_1',
              'has-been-asked-in-certif': false,
              'tube-id': 'recTube1',
              difficulty: 1,
            },
          },
          {
            id: 'recSkill2',
            type: 'certified-skills',
            attributes: {
              name: 'skill_2',
              'has-been-asked-in-certif': true,
              'tube-id': 'recTube1',
              difficulty: 2,
            },
          },
          {
            id: 'recTube1',
            type: 'certified-tubes',
            attributes: {
              name: 'tube_1',
              'competence-id': 'recCompetence1',
            },
          },
          {
            id: 'recCompetence1',
            type: 'certified-competences',
            attributes: {
              name: 'competence_1',
              'area-id': 'recArea1',
              origin: 'Pix',
            },
          },
          {
            id: 'recArea1',
            type: 'certified-areas',
            attributes: {
              name: 'area_1',
              color: 'someColor',
            },
          },
        ],
      };

      // when
      const actualCertifiedProfileSerialized = serializer.serialize(certifiedProfile);

      // then
      return expect(actualCertifiedProfileSerialized).to.deep.equal(expectedCertifiedProfileSerialized);
    });
  });
});
