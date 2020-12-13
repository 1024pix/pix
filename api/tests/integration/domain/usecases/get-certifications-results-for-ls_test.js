const {
  airtableBuilder, expect, databaseBuilder,
} = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationsResults = require('../../../../lib/domain/read-models/livret-scolaire/CertificationsResults');
const certificationLsRepository = require('../../../../lib/infrastructure/repositories/certification-ls-repository');
const competenceTreeRepository = require('../../../../lib/infrastructure/repositories/competence-tree-repository');
const getCertificationsResultsForLS = require('../../../../lib/domain/usecases/certificate/get-certifications-results-for-ls');
const { buildValidatedPublishedCertificationData, mockAirTableCompetences } = require('../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls');

describe('Integration | UseCase | getCertificationsResultsForLS', () => {

  const type = Assessment.types.CERTIFICATION;
  const pixScore = 400;
  const uai = 789567;
  const verificationCode = 'P-123498NN';

  beforeEach(() => {
    mockAirTableCompetences();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  it('should return certifications results with a referential of competences', async () => {
    // given
    const { schoolingRegistration, session, certificationCourse } = buildValidatedPublishedCertificationData({ uai, verificationCode, type, pixScore });

    await databaseBuilder.commit();

    const expectedCertificationResult = {
      'certifications':
        [
          {
            id: certificationCourse.id,
            firstName: schoolingRegistration.firstName,
            middleName: schoolingRegistration.middleName,
            thirdName: schoolingRegistration.thirdName,
            lastName: schoolingRegistration.lastName,
            nationalStudentId: schoolingRegistration.nationalStudentId,
            birthdate: schoolingRegistration.birthdate,
            date: certificationCourse.createdAt,
            verificationCode: certificationCourse.verificationCode,
            deliveredAt: session.publishedAt,
            certificationCenter: session.certificationCenter,
            status: 'validated',
            pixScore,
            competenceResults: [
              { competenceId: '1.1', level: 6 },
              { competenceId: '5.2', level: 4 },
            ],
          },
        ],
      'competences':
        [
          {
            'area': {
              'id': '2',
              'name': 'Communication et collaboration',
            },
            'id': '2.1',
            'name': 'Interagir',
          },
          {
            'area': {
              'id': '2',
              'name': 'Communication et collaboration',
            },
            'id': '2.2',
            'name': 'Partager et publier',
          },
          {
            'area': {
              'id': '2',
              'name': 'Communication et collaboration',
            },
            'id': '2.3',
            'name': 'Collaborer',
          },
          {
            'area': {
              'id': '3',
              'name': 'Création de contenu',
            },
            'id': '3.1',
            'name': 'Développer des documents textuels',
          },
          {
            'area': {
              'id': '3',
              'name': 'Création de contenu',
            },
            'id': '3.2',
            'name': 'Développer des documents multimedia',
          },
          {
            'area': {
              'id': '1',
              'name': 'Information et données',
            },
            'id': '1.1',
            'name': 'Mener une recherche et une veille d’information',
          },
          {
            'area': {
              'id': '1',
              'name': 'Information et données',
            },
            'id': '1.2',
            'name': 'Gérer des données',
          },
        ],
    };

    // when
    const foundCertificationsResults = await getCertificationsResultsForLS({
      uai,
      certificationLsRepository,
      competenceTreeRepository,
    });
    // then
    expect(foundCertificationsResults).to.be.instanceOf(CertificationsResults);
    expect(foundCertificationsResults).to.deep.equal(expectedCertificationResult);
  });

});

