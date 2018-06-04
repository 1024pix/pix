const CertifiedProfile = require('../../../../lib/domain/models/CertifiedProfile');
const factory = require('../../../factory');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | CertifiedProfile', () => {

  describe('#constructor', () => {

    const competenceMark = factory.buildCompetenceMark({ competence_code: '2.1', level: 2 });

    const listOfCompetence = [
      {
        name: 'Sécuriser',
        index: '4.1',
        area: {
          code: '4',
          title: 'Protection',
        },
      },
      {
        name: 'Interagir',
        index: '2.1',
        area: {
          code: '2',
          title: 'Communiquer et collaborer',
        },
      },
    ];

    it('should return an object contains list of competences with marks', () => {
      // given
      const expectedCompetencesAndMarks = [
        {
          competenceName: 'Sécuriser',
          competenceIndex: '4.1',
          level: -1,
          areaIndex: '4',
          areaName: 'Protection',
        },
        {
          competenceName: 'Interagir',
          competenceIndex: '2.1',
          level: 2,
          areaIndex: '2',
          areaName: 'Communiquer et collaborer',
        },
      ];

      // when
      const certifiedProfile = new CertifiedProfile(
        {
          allCompetences: listOfCompetence,
          competencesEvaluated: [competenceMark]
        });

      // then
      expect(certifiedProfile.competencesWithMark).to.deep.equal(expectedCompetencesAndMarks);
    });

  });

  describe('#organizeCompetences', () => {

    it('should return the list of competences ordered and organized by domains', () => {
      const competenceMark = factory.buildCompetenceMark({ competence_code: '2.1', level: 2 });

      const listOfCompetence = [
        {
          name: 'Sécuriser',
          index: '4.1',
          area: {
            code: '4',
            title: 'Protection',
          },
        },
        {
          name: 'Collaborer',
          index: '2.2',
          area: {
            code: '2',
            title: 'Communiquer et collaborer',
          },
        },
        {
          name: 'Interagir',
          index: '2.1',
          area: {
            code: '2',
            title: 'Communiquer et collaborer',
          },
        },
      ];
      const certifiedProfile = new CertifiedProfile(
        {
          allCompetences: listOfCompetence,
          competencesEvaluated: [competenceMark]
        });

      const expectedOrganizedCompetences = [
        {
          areaIndex: '2',
          areaName: 'Communiquer et collaborer',
          competences: [
            {
              competenceName: 'Interagir',
              competenceIndex: '2.1',
              level: 2,
            },
            {
              competenceName: 'Collaborer',
              competenceIndex: '2.2',
              level: -1,
            }
          ]
        },
        {
          areaIndex: '4',
          areaName: 'Protection',
          competences: [
            {
              competenceName: 'Sécuriser',
              competenceIndex: '4.1',
              level: -1,
            }
          ]
        }
      ];

      // when
      const organizedCompetences = certifiedProfile.organizeCompetences();

      // then
      expect(organizedCompetences).to.deep.equal(expectedOrganizedCompetences);
      expect(organizedCompetences[0].areaIndex).to.equal('2');
      expect(organizedCompetences[1].areaIndex).to.equal('4');
      expect(organizedCompetences[0].competences[0].competenceIndex).to.equal('2.1');
      expect(organizedCompetences[0].competences[1].competenceIndex).to.equal('2.2');
      expect(organizedCompetences[1].competences[0].competenceIndex).to.equal('4.1');
    });
  });

});
