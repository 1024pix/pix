import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | V3CertificationCourseDetailsForAdministration', function () {
  describe('setCompetencesDetails', function () {
    describe('if there are challenges', function () {
      it('should set the competence name and ids', function () {
        const certificationCourseId = 123;
        const competenceId = 'competenceID';
        const competenceName = 'competenceName';
        const competenceIndex = '1.2';

        const competenceList = [
          domainBuilder.buildCompetence({
            id: competenceId,
            name: competenceName,
            index: competenceIndex,
          }),
          domainBuilder.buildCompetence({
            id: 'other',
            name: 'otherName',
            index: 'otherIndex',
          }),
        ];

        const challenge = domainBuilder.buildV3CertificationChallengeForAdministration({
          competenceId,
        });

        const courseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
          certificationCourseId,
          certificationChallengesForAdministration: [challenge],
        });

        courseDetails.setCompetencesDetails(competenceList);

        expect(courseDetails.certificationChallengesForAdministration[0]).to.deep.equal(
          domainBuilder.buildV3CertificationChallengeForAdministration({
            competenceId,
            competenceName,
            competenceIndex,
          }),
        );
      });
    });

    describe('if there are not challenges', function () {
      it('should set the competence name and ids', function () {
        const certificationCourseId = 123;
        const competenceId = 'competenceID';
        const competenceName = 'competenceName';
        const competenceIndex = '1.2';

        const competenceList = [
          domainBuilder.buildCompetence({
            id: competenceId,
            name: competenceName,
            index: competenceIndex,
          }),
        ];

        const courseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
          certificationCourseId,
          certificationChallengesForAdministration: [],
        });

        courseDetails.setCompetencesDetails(competenceList);

        expect(courseDetails.certificationChallengesForAdministration).to.deep.equal([]);
      });
    });
  });

  describe('#get reachedResultKey', function () {
    context('CORE', function () {
      [
        { reachedMeshIndex: null, expectedReachedResultKey: 'CORE.BELOW_MINIMUM' },
        { reachedMeshIndex: 0, expectedReachedResultKey: 'CORE.0' },
        { reachedMeshIndex: 1, expectedReachedResultKey: 'CORE.1' },
        { reachedMeshIndex: 2, expectedReachedResultKey: 'CORE.2' },
        { reachedMeshIndex: 3, expectedReachedResultKey: 'CORE.3' },
        { reachedMeshIndex: 4, expectedReachedResultKey: 'CORE.4' },
        { reachedMeshIndex: 5, expectedReachedResultKey: 'CORE.5' },
        { reachedMeshIndex: 6, expectedReachedResultKey: 'CORE.6' },
        { reachedMeshIndex: 7, expectedReachedResultKey: 'CORE.7' },
        { reachedMeshIndex: 8, expectedReachedResultKey: 'CORE.8' },
      ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
        context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
          it(`returns ${expectedReachedResultKey}`, function () {
            const certificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
              certificationFramework: Frameworks.CORE,
              reachedMeshIndex,
            });
            const reachedResultKey = certificationCourseDetails.reachedResultKey;

            expect(reachedResultKey).to.equal(expectedReachedResultKey);
          });
        });
      });
    });

    context('EDU', function () {
      [
        {
          reachedMeshIndex: null,
          eduV3ExternalJuryResult: null,
          expectedReachedResultKey: 'EDU_1ER_DEGRE.BELOW_MINIMUM',
        },
        { reachedMeshIndex: 0, eduV3ExternalJuryResult: null, expectedReachedResultKey: 'EDU_1ER_DEGRE.0' },
        {
          reachedMeshIndex: 0,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
          expectedReachedResultKey: 'EDU_1ER_DEGRE.ADVANCED',
        },
        {
          reachedMeshIndex: 0,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
          expectedReachedResultKey: 'EDU_1ER_DEGRE.EXPERT',
        },
      ].forEach(({ reachedMeshIndex, eduV3ExternalJuryResult, expectedReachedResultKey }) => {
        context(
          `when reachedMeshIndex is ${reachedMeshIndex} and eduV3ExternalJuryResult is ${eduV3ExternalJuryResult}`,
          function () {
            it(`returns ${expectedReachedResultKey}`, function () {
              const certificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
                certificationFramework: Frameworks.EDU_1ER_DEGRE,
                eduV3ExternalJuryResult,
                reachedMeshIndex,
              });

              const reachedResultKey = certificationCourseDetails.reachedResultKey;

              expect(reachedResultKey).to.equal(expectedReachedResultKey);
            });
          },
        );
      });
    });

    context('DROIT', function () {
      [
        {
          reachedMeshIndex: null,
          expectedReachedResultKey: 'DROIT.BELOW_MINIMUM',
        },
        { reachedMeshIndex: 0, expectedReachedResultKey: 'DROIT.0' },
      ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
        context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
          it(`returns ${expectedReachedResultKey}`, function () {
            const certificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
              certificationFramework: Frameworks.DROIT,
              reachedMeshIndex,
            });

            const reachedResultKey = certificationCourseDetails.reachedResultKey;

            expect(reachedResultKey).to.equal(expectedReachedResultKey);
          });
        });
      });
    });

    context('PRO SANTÉ', function () {
      [
        {
          reachedMeshIndex: null,
          expectedReachedResultKey: 'PRO_SANTE.BELOW_MINIMUM',
        },
        { reachedMeshIndex: 0, expectedReachedResultKey: 'PRO_SANTE.0' },
      ].forEach(({ reachedMeshIndex, expectedReachedResultKey }) => {
        context(`when reachedMeshIndex is ${reachedMeshIndex}`, function () {
          it(`returns ${expectedReachedResultKey}`, function () {
            const certificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
              certificationFramework: Frameworks.PRO_SANTE,
              reachedMeshIndex,
            });

            const reachedResultKey = certificationCourseDetails.reachedResultKey;

            expect(reachedResultKey).to.equal(expectedReachedResultKey);
          });
        });
      });
    });
  });
});
