import sinon from 'sinon';

import { getV3CertificationCourseDetailsForAdministration } from '../../../../../../src/certification/session-management/domain/usecases/get-v3-certification-course-details-for-administration.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-certification-course-details-for-administration', function () {
  it('should return the details with the associated competence name and number of challenges', async function () {
    // given
    const certificationCourseId = '1234';
    const challengeId = 'challenge1';
    const answerStatus = AnswerStatus.OK;
    const answeredAt = new Date(2020, 2, 1);
    const competenceId = 'competenceId';
    const skillName = 'skillName';
    const competenceName = 'competenceName';
    const competenceIndex = '1.2';
    const numberOfChallenges = 64;

    const v3CertificationCourseDetailsForAdministrationRepository = {
      getV3DetailsByCertificationCourseId: sinon.stub(),
    };

    const competenceRepository = {
      list: sinon.stub(),
    };

    const versionApi = {
      getById: sinon.stub(),
    };

    const competences = [
      domainBuilder.buildCompetence({
        id: competenceId,
        name: competenceName,
        index: competenceIndex,
      }),
    ];

    const challengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration({
      challengeId,
      answerStatus,
      answeredAt,
      competenceId,
      skillName,
    });

    const expectedDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
      certificationCourseId,
      numberOfChallenges: null,
      certificationChallengesForAdministration: [challengeForAdministration],
      versionId: 123,
    });

    const version = {
      challengesConfiguration: {
        maximumAssessmentLength: numberOfChallenges,
      },
    };

    v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId
      .withArgs({ certificationCourseId })
      .returns(expectedDetails);

    competenceRepository.list.resolves(competences);

    versionApi.getById.withArgs({ id: 123 }).resolves(version);

    // when
    const details = await getV3CertificationCourseDetailsForAdministration({
      certificationCourseId,
      v3CertificationCourseDetailsForAdministrationRepository,
      competenceRepository,
      versionApi,
    });

    // then
    expect(details).to.deep.equal({
      ...expectedDetails,
      numberOfChallenges,
      certificationChallengesForAdministration: [
        {
          ...challengeForAdministration,
          competenceName,
          competenceIndex,
        },
      ],
    });
  });
});
