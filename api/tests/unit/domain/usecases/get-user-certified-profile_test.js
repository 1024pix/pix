const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-user-certified-profile', () => {

  const userId = '2';
  const certificationId = '23';
  const assessmentRepository = {
    getByCertificationCourseId() {
    },
  };
  const competenceMarksRepository = {
    findByAssessmentResultId() {
    },
  };

  const competenceRepository = {
    list() {
    },
  };

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

  beforeEach(() => {
    assessmentRepository.getByCertificationCourseId = sinon.stub();
    competenceMarksRepository.findByAssessmentResultId = sinon.stub().resolves([competenceMark]);
    competenceRepository.list = sinon.stub().resolves(listOfCompetence);
  });

  it('should get the certification from the repository', () => {
    // given
    const assessment = factory.buildAssessment({ userId: parseInt(userId, 10) });
    assessmentRepository.getByCertificationCourseId.resolves(assessment);

    // when
    const promise = usecases.getUserCertifiedProfile({ certificationId, userId, assessmentRepository, competenceMarksRepository, competenceRepository });

    // then
    return promise.then(() => {
      expect(assessmentRepository.getByCertificationCourseId).to.have.been.calledWith(certificationId);
    });
  });

  context('when the user is owner of the certification', () => {

    it('should find competenceMarks of AssessmentResult from Certification', () => {
      // given
      const assessment = factory.buildAssessment({ userId: parseInt(userId, 10) });
      assessmentRepository.getByCertificationCourseId.resolves(assessment);

      // when
      const promise = usecases.getUserCertifiedProfile({ certificationId, userId, assessmentRepository, competenceMarksRepository, competenceRepository });

      // then
      return promise.then(() => {
        expect(competenceMarksRepository.findByAssessmentResultId).to.have.been.calledWith(assessment.getLastAssessmentResult().id);
      });
    });

    it('should find all competences and domains', () => {
      // given
      const assessment = factory.buildAssessment({ userId: parseInt(userId, 10) });
      assessmentRepository.getByCertificationCourseId.resolves(assessment);

      // when
      const promise = usecases.getUserCertifiedProfile({ certificationId, userId, assessmentRepository, competenceMarksRepository, competenceRepository });

      // then
      return promise.then(() => {
        expect(competenceRepository.list).to.have.been.calledOnce;
      });
    });

    it('should return a list of all competence with marks', () => {
      // given
      const assessment = factory.buildAssessment({ userId: parseInt(userId, 10) });
      assessmentRepository.getByCertificationCourseId.resolves(assessment);
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
      const promise = usecases.getUserCertifiedProfile({ certificationId, userId, assessmentRepository, competenceMarksRepository, competenceRepository });

      // then
      return promise.then((result) => {
        expect(result.competencesWithMark).to.deep.equal(expectedCompetencesAndMarks);
      });
    });

  });

  context('when the user is not owner of the certification', () => {

    it('should throw an unauthorized error', () => {
      // given
      const assessment = factory.buildAssessment({ userId: '666' });
      assessmentRepository.getByCertificationCourseId.resolves(assessment);

      // when
      const promise = usecases.getUserCertifiedProfile({ certificationId, userId, assessmentRepository, competenceMarksRepository });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

});

