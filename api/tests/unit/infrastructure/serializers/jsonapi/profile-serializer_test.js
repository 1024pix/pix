const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const Profile = require('../../../../../lib/domain/models/data/profile');
const User = require('../../../../../lib/domain/models/data/user');
const Organization = require('../../../../../lib/domain/models/data/organization');
const Assessment = require('../../../../../lib/domain/models/data/assessment');

describe('Unit | Serializer | JSONAPI | profile-serializer', () => {

  describe('#serialize', function() {

    let user;
    let areas;
    let competences;
    let organizations;
    let finishedAssessment;
    let nonFinishedAssessment;
    let assessments;
    let courses;

    let emptyCompetences;
    let emptyAreas;
    let emptyAssessments;
    let emptyCourses;
    let emptyOrganizations;

    beforeEach(() => {
      emptyCompetences = [];
      emptyAreas = [];
      emptyAssessments = [];
      emptyCourses = [];
      emptyOrganizations = [];

      user = new User({
        id: 'user_id',
        'firstName': 'Luke',
        'lastName': 'Skywalker',
        'email': 'luke@sky.fr'
      });

      areas = [
        {
          id: 'recAreaA',
          name: 'area-name-1'
        },
        {
          id: 'recAreaB',
          name: 'area-name-2'
        }
      ];

      competences = [
        {
          id: 'recCompA',
          name: 'competence-name-1',
          index: '1.1',
          areaId: 'recAreaA',
          courseId: 'courseID1',
          assessmentId : 'assessmentId1'
        },
        {
          id: 'recCompB',
          name: 'competence-name-2',
          index: '1.2',
          areaId: 'recAreaB',
          courseId: 'courseID2',
          assessmentId : 'assessmentId2'
        },
        {
          id: 'recCompC',
          name: 'competence-name-3',
          index: '1.3',
          areaId: 'recAreaB',
          courseId: 'courseID3'
        }];

      organizations = [
        new Organization({
          id: 'organizationId1',
          name: 'etablissement 1',
          email: 'best.etablishment@company.com',
          type: 'SCO',
          code: 'ABCD12'
        }),
        new Organization({
          id: 'organizationId2',
          name: 'etablissement 2',
          email: 'best.enterprise@company.com',
          type: 'PRO',
          code: 'EFGH34'
        })
      ];

      finishedAssessment = new Assessment({
        id : 'assessmentID1',
        courseId: 'courseID1',
        estimatedLevel: 8,
        pixScore: 128
      });
      nonFinishedAssessment = new Assessment({
        id : 'assessmentID2',
        courseId: 'courseID2',
        estimatedLevel: null,
        pixScore: null,
      });

      assessments = [finishedAssessment, nonFinishedAssessment];

      courses = [{ id: 'courseID1', competences: ['recCompA'] },
        { id: 'courseID2', competences: ['recCompB'] },
        { id: 'courseID3', competences: ['recCompC'] }
      ];

    });

    it('should serialize a Profile into JSON:API data of type "users"', function() {
      // Given
      const profile = new Profile(user, competences, areas, assessments, courses, emptyOrganizations);
      const expectedJson = {
        data: {
          type: 'users',
          id: 'user_id',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            'total-pix-score': 128,
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
              level: 8,
              'pix-score': 128,
              'course-id': 'courseID1',
              'assessment-id': 'assessmentID1'
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
              'course-id': 'courseID2',
              'assessment-id': 'assessmentID2'
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
              level: -1,
              'course-id': 'courseID3'
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

      // When
      const userSerialized = serializer.serialize(profile);

      // Then
      expect(userSerialized).to.be.deep.equal(expectedJson);
    });

    it('should not serialize "total-pix-score" user attribute when no assessments', function() {
      // Given
      const profile = new Profile(user, competences, areas, emptyAssessments, emptyCourses, emptyOrganizations);

      // When
      const userSerialized = serializer.serialize(profile);

      // Then
      expect(userSerialized.data.attributes).not.to.have.property('total-pix-score');
    });

    it('should serialize organizations if user is admin of some organizations', function() {
      // Given
      const profile = new Profile(user, emptyCompetences, emptyAreas, emptyAssessments, emptyCourses, organizations);
      const expectedJsonWithOrganisations = {
        data: {
          type: 'users',
          id: 'user_id',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            'email': 'luke@sky.fr'
          },
          relationships: {
            organizations: {
              data: [
                { type: 'organizations', id: 'organizationId1' },
                { type: 'organizations', id: 'organizationId2' }
              ]
            }
          },
        },
        included: [
          {
            type: 'organizations',
            id: 'organizationId1',
            attributes: {
              name: 'etablissement 1',
              email: 'best.etablishment@company.com',
              type: 'SCO',
              code: 'ABCD12'
            },
            relationships: {
              snapshots: {
                links: {
                  related: '/api/organizations/organizationId1/snapshots'
                }
              }
            }
          },
          {
            type: 'organizations',
            id: 'organizationId2',
            attributes: {
              name: 'etablissement 2',
              email: 'best.enterprise@company.com',
              type: 'PRO',
              code: 'EFGH34'
            },
            relationships: {
              snapshots: {
                links: {
                  related: '/api/organizations/organizationId2/snapshots'
                }
              }
            }
          }
        ]
      };

      // When
      const userSerialized = serializer.serialize(profile);

      // Then
      expect(userSerialized).to.be.deep.equal(expectedJsonWithOrganisations);
    });

  });

});
