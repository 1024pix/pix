const { describe, it, expect } = require('../../../test-helper');
const { getNumberOfFinishedTests } = require('../../../../lib/domain/services/profile-completion-service');

describe('Unit | Service | profile number of finished tests service', function() {

  describe('#getNumberOfFinishedTests', () => {

    const notEvaluatedProfile = {
      data: {
        type: 'users',
        id: 'user_id',
        attributes: {
          'first-name': 'Luke',
          'last-name': 'Skywalker',
          'email': 'luke@sky.fr'
        },
        relationships: {
          competences: {
            data: [
              { type: 'competences', id: 'recCompA' },
              { type: 'competences', id: 'recCompB' }
            ]
          }
        },
      },
      included: [
        {
          type: 'areas',
          id: 'recAreaA',
          attributes: {
            name: 'area-name-1'
          }
        },
        {
          type: 'areas',
          id: 'recAreaB',
          attributes: {
            name: 'area-name-2'
          }
        },
        {
          type: 'competences',
          id: 'recCompA',
          attributes: {
            name: 'competence-name-1',
            index: '1.1',
            level: -1,
            'course-id': 'recBxPAuEPlTgt72q11'
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recAreaA'
              }
            }
          }
        },
        {
          type: 'competences',
          id: 'recCompB',
          attributes: {
            name: 'competence-name-2',
            index: '1.2',
            level: -1,
            'course-id': 'recBxPAuEPlTgt72q99'
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recAreaB'
              }
            }
          }
        }
      ]
    };
    const profileWithTwoCompetencesEvaluated = {
      data: {
        type: 'users',
        id: 'user_id',
        attributes: {
          'first-name': 'Luke',
          'last-name': 'Skywalker',
          'email': 'luke@sky.fr'
        },
        relationships: {
          competences: {
            data: [
              { type: 'competences', id: 'recCompA' },
              { type: 'competences', id: 'recCompB' },
              { type: 'competences', id: 'recCompC' }
            ]
          }
        },
      },
      included: [
        {
          type: 'areas',
          id: 'recAreaA',
          attributes: {
            name: 'area-name-1'
          }
        },
        {
          type: 'areas',
          id: 'recAreaB',
          attributes: {
            name: 'area-name-2'
          }
        },
        {
          type: 'competences',
          id: 'recCompA',
          attributes: {
            name: 'competence-name-1',
            index: '1.1',
            level: 5,
            'course-id': 'recBxPAuEPlTgt72q11'
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recAreaA'
              }
            }
          }
        },
        {
          type: 'competences',
          id: 'recCompB',
          attributes: {
            name: 'competence-name-2',
            index: '1.2',
            level: -1,
            'course-id': 'recBxPAuEPlTgt72q99'
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recAreaB'
              }
            }
          }
        },
        {
          type: 'competences',
          id: 'recCompC',
          attributes: {
            name: 'competence-name-3',
            index: '1.3',
            level: 2,
            'course-id': 'recBxPAuEPlTgt72q00'
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'recAreaB'
              }
            }
          }
        }
      ]
    };

    const profileWithAllComptencesEvaluated = {
      'data': {
        'type': 'users',
        'id': 10,
        'attributes': {
          'first-name': 'Flo',
          'last-name': '3pixOuLouLou',
          'email': 'flo3pix@pix.fr',
        },
        'relationships': {
          'competences': {
            'data': [
              {
                'type': 'competences',
                'id': 'rec6rHqas39zvLZep'
              },
              {
                'type': 'competences',
                'id': 'recDH19F7kKrfL3Ii'
              },
              {
                'type': 'competences',
                'id': 'recFpYXCKcyhLI3Nu'
              },
              {
                'type': 'competences',
                'id': 'recHmIWG6D0huq6Kx'
              },
              {
                'type': 'competences',
                'id': 'recIhdrmCuEmCDAzj'
              },
              {
                'type': 'competences',
                'id': 'recIkYm646lrGvLNT'
              },
              {
                'type': 'competences',
                'id': 'recMiZPNl7V1hyE1d'
              },
              {
                'type': 'competences',
                'id': 'recNv8qhaY887jQb2'
              },
              {
                'type': 'competences',
                'id': 'recOdC9UDVJbAXHAm'
              },
              {
                'type': 'competences',
                'id': 'recbDTF8KwupqkeZ6'
              },
              {
                'type': 'competences',
                'id': 'rece6jYwH4WEw549z'
              },
              {
                'type': 'competences',
                'id': 'recfr0ax8XrfvJ3ER'
              },
              {
                'type': 'competences',
                'id': 'recgxqQfz3BqEbtzh'
              },
              {
                'type': 'competences',
                'id': 'recofJCxg0NqTqTdP'
              },
              {
                'type': 'competences',
                'id': 'recsvLz0W2ShyfD63'
              },
              {
                'type': 'competences',
                'id': 'recudHE5Omrr10qrx'
              }
            ]
          },
          'organizations': {
            'data': [
              {
                'type': 'organizations',
                'id': 1
              }
            ]
          }
        }
      },
      'included': [
        {
          'id': 'recUYdRjvdC5p7AE1',
          'type': 'areas',
          'attributes': {}
        },
        {
          'id': 'recUcSnS2lsOhFIeE',
          'type': 'areas',
          'attributes': {
            'name': '4. Protection et sécurité'
          }
        },
        {
          'id': 'recnrCmBiPXGbgIyQ',
          'type': 'areas',
          'attributes': {
            'name': '5. Environnement numérique'
          }
        },
        {
          'id': 'recoB4JYOBS1PCxhh',
          'type': 'areas',
          'attributes': {
            'name': '2. Communication et collaboration'
          }
        },
        {
          'id': 'recs7Gpf90ln8NCv7',
          'type': 'areas',
          'attributes': {
            'name': '3. Création de contenu'
          }
        },
        {
          'id': 'recvoGdo7z2z7pXWa',
          'type': 'areas',
          'attributes': {
            'name': '1. Information et données'
          }
        },
        {
          'id': 'rec6rHqas39zvLZep',
          'type': 'competences',
          'attributes': {
            'name': 'Sécuriser l\'environnement numérique',
            'index': '4.1',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recUcSnS2lsOhFIeE'
                ]
              }
            }
          }
        },
        {
          'id': 'recDH19F7kKrfL3Ii',
          'type': 'competences',
          'attributes': {
            'name': 'Interagir',
            'index': '2.1',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recoB4JYOBS1PCxhh'
                ]
              }
            }
          }
        },
        {
          'id': 'recFpYXCKcyhLI3Nu',
          'type': 'competences',
          'attributes': {
            'name': 'S\'insérer dans le monde numérique',
            'index': '2.4',
            'level': 2,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recoB4JYOBS1PCxhh'
                ]
              }
            }
          }
        },
        {
          'id': 'recHmIWG6D0huq6Kx',
          'type': 'competences',
          'attributes': {
            'name': 'Adapter les documents à leur finalité',
            'index': '3.3',
            'level': 1,
            'course-id': 'recRKkLdx99wfl3qs'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recs7Gpf90ln8NCv7'
                ]
              }
            }
          }
        },
        {
          'id': 'recIhdrmCuEmCDAzj',
          'type': 'competences',
          'attributes': {
            'name': 'Résoudre des problèmes techniques',
            'index': '5.1',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recnrCmBiPXGbgIyQ'
                ]
              }
            }
          }
        },
        {
          'id': 'recIkYm646lrGvLNT',
          'type': 'competences',
          'attributes': {
            'name': 'Gérer des données',
            'index': '1.2',
            'level': 1,
            'course-id': 'recAY0W7xurA11OLZ'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recvoGdo7z2z7pXWa'
                ]
              }
            }
          }
        },
        {
          'id': 'recMiZPNl7V1hyE1d',
          'type': 'competences',
          'attributes': {
            'name': 'Collaborer',
            'index': '2.3',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recoB4JYOBS1PCxhh'
                ]
              }
            }
          }
        },
        {
          'id': 'recNv8qhaY887jQb2',
          'type': 'competences',
          'attributes': {
            'name': 'Traiter des données',
            'index': '1.3',
            'level': 1,
            'course-id': 'recR9yCEqgedB0LYQ'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recvoGdo7z2z7pXWa'
                ]
              }
            }
          }
        },
        {
          'id': 'recOdC9UDVJbAXHAm',
          'type': 'competences',
          'attributes': {
            'name': 'Développer des documents textuels',
            'index': '3.1',
            'level': 1,
            'course-id': 'rec43mpMIR5dUzdjh'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recs7Gpf90ln8NCv7'
                ]
              }
            }
          }
        },
        {
          'id': 'recbDTF8KwupqkeZ6',
          'type': 'competences',
          'attributes': {
            'name': 'Développer des documents multimedia',
            'index': '3.2',
            'level': 1,
            'course-id': 'recVtTay20uxEqubF'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recs7Gpf90ln8NCv7'
                ]
              }
            }
          }
        },
        {
          'id': 'rece6jYwH4WEw549z',
          'type': 'competences',
          'attributes': {
            'name': 'Programmer',
            'index': '3.4',
            'level': 1,
            'course-id': 'recTMfUJzFaNiUt64'
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recs7Gpf90ln8NCv7'
                ]
              }
            }
          }
        },
        {
          'id': 'recfr0ax8XrfvJ3ER',
          'type': 'competences',
          'attributes': {
            'name': 'Protéger la santé, le bien-être et l\'environnement',
            'index': '4.3',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recUcSnS2lsOhFIeE'
                ]
              }
            }
          }
        },
        {
          'id': 'recgxqQfz3BqEbtzh',
          'type': 'competences',
          'attributes': {
            'name': 'Partager et publier',
            'index': '2.2',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recoB4JYOBS1PCxhh'
                ]
              }
            }
          }
        },
        {
          'id': 'recofJCxg0NqTqTdP',
          'type': 'competences',
          'attributes': {
            'name': 'Protéger les données personnelles et la vie privée',
            'index': '4.2',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recUcSnS2lsOhFIeE'
                ]
              }
            }
          }
        },
        {
          'id': 'recsvLz0W2ShyfD63',
          'type': 'competences',
          'attributes': {
            'name': 'Mener une recherche et une veille d’information',
            'index': '1.1',
            'level': 0,
            'course-id': 'recNPB7dTNt5krlMA',
            'pix-score': 2
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recvoGdo7z2z7pXWa'
                ]
              }
            }
          }
        },
        {
          'id': 'recudHE5Omrr10qrx',
          'type': 'competences',
          'attributes': {
            'name': 'Construire un environnement numérique',
            'index': '5.2',
            'level': 1,
            'course-id': ''
          },
          'relationships': {
            'area': {
              'data': {
                'type': 'areas',
                'id': [
                  'recnrCmBiPXGbgIyQ'
                ]
              }
            }
          }
        },
        {
          'id': 1,
          'type': 'organizations',
          'attributes': {
            'name': 'PixouLoulou',
            'email': 'flo3pix@pix.fr',
            'type': 'SUP',
            'code': 'QLME11'
          }
        }
      ]
    };

    it('should return 0 when no competence has been evaluated', () => {
      // when
      const promise = getNumberOfFinishedTests(notEvaluatedProfile);

      //then
      return promise.then((percentage) => {
        expect(percentage).to.equal(0);
      });
    });

    it('should return 2 when only 2 competences have been evaluated', () => {
      // when
      const promise = getNumberOfFinishedTests(profileWithTwoCompetencesEvaluated);

      //then
      return promise.then((percentage) => {
        expect(percentage).to.equal(2);
      });
    });

    it('should return 16 when all competences have been evaluated', () => {
      // when
      const promise = getNumberOfFinishedTests(profileWithAllComptencesEvaluated);

      //then
      return promise.then((percentage) => {
        expect(percentage).to.equal(16);
      });
    });
  });

});
