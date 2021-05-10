const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { computeForCertification } = require('../../../../lib/domain/services/result-competence-tree-service');
const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');
const ResultCompetence = require('../../../../lib/domain/models/ResultCompetence');

describe('Unit | Service | result-competence-tree', () => {

  const assessmentResultRepository = {
    findLatestByCertificationCourseIdWithCompetenceMarks: _.noop(),
  };
  const competenceTreeRepository = {
    get: _.noop(),
  };

  beforeEach(() => {
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub();
    competenceTreeRepository.get = sinon.stub();
  });

  it('should set the computed resultCompetenceTree to the certificate', async () => {
    // given
    const competence1_1 = domainBuilder.buildCompetence({
      id: 'recCOMP1_1',
      name: 'Nom compétence 1_1',
      index: '1.1',
    });
    const competence1_2 = domainBuilder.buildCompetence({
      id: 'recCOMP1_2',
      name: 'Nom compétence 1_2',
      index: '1.2',
    });
    const area1 = domainBuilder.buildArea({
      id: 'recAREA1',
      code: 1,
      name: 'Nom domaine 1',
      title: 'Titre domain 1',
      color: 'blue',
      competences: [competence1_1, competence1_2],
    });
    const competence2_1 = domainBuilder.buildCompetence({
      id: 'recCOMP2_1',
      name: 'Nom compétence 2_1',
      index: '2.1',
    });
    const area2 = domainBuilder.buildArea({
      id: 'recAREA2',
      code: 2,
      name: 'Nom domaine 2',
      title: 'Titre domain 2',
      color: 'violet',
      competences: [competence2_1],
    });
    const competenceTree = domainBuilder.buildCompetenceTree({
      areas: [area1, area2],
    });
    competenceTreeRepository.get.resolves(competenceTree);
    const competenceMark1 = domainBuilder.buildCompetenceMark({
      level: 3,
      score: 66,
      area_code: 1,
      competence_code: '1.2',
      competenceId: 'recCOMP1_2',
    });
    const competenceMark2 = domainBuilder.buildCompetenceMark({
      level: 5,
      score: 45,
      area_code: 2,
      competence_code: '2.1',
      competenceId: 'recCOMP2_1',
    });
    const assessmentResult = domainBuilder.buildAssessmentResult({
      id: 456,
      competenceMarks: [competenceMark1, competenceMark2],
    });
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks
      .withArgs({ certificationCourseId: 123 })
      .resolves(assessmentResult);

    // when
    const resultCompetenceTree = await computeForCertification({
      certificationId: 123,
      assessmentResultRepository,
      competenceTreeRepository,
    });

    // then
    const expectedArea1 = _.cloneDeep(area1);
    delete expectedArea1.competences;
    const expectedArea2 = _.cloneDeep(area2);
    delete expectedArea2.competences;
    const expectedResultCompetence1_1 = new ResultCompetence({
      id: 'recCOMP1_1',
      index: '1.1',
      name: 'Nom compétence 1_1',
      level: -1,
      score: 0,
    });
    const expectedResultCompetence1_2 = new ResultCompetence({
      id: 'recCOMP1_2',
      index: '1.2',
      name: 'Nom compétence 1_2',
      level: 3,
      score: 66,
    });
    const expectedResultCompetence2_1 = new ResultCompetence({
      id: 'recCOMP2_1',
      index: '2.1',
      name: 'Nom compétence 2_1',
      level: 5,
      score: 45,
    });
    expectedArea1.resultCompetences = [expectedResultCompetence1_1, expectedResultCompetence1_2];
    expectedArea2.resultCompetences = [expectedResultCompetence2_1];
    const expectedResultCompetenceTree = new ResultCompetenceTree({
      id: '123-456',
      areas: [expectedArea1, expectedArea2],
    });
    expect(resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);
  });
});
