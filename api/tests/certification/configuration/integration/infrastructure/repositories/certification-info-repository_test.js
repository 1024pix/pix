import { findAllByFramework } from '../../../../../../src/certification/configuration/infrastructure/repositories/certification-info-repository.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | CertificationInfo', function () {
  describe('#findAllByFramework', function () {
    context('when there are no versions for a framework', function () {
      it('returns an empty array', async function () {
        databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.PIX_PLUS_DROIT,
        });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.PRO_SANTE);

        // then
        expect(certificationInfos).to.be.empty;
      });
    });

    context('when there are some versions for a framework', function () {
      it('returns an array containing relevant certification info models', async function () {
        databaseBuilder.factory.buildCertificationVersion({
          id: 1,
          scope: SCOPES.PIX_PLUS_DROIT,
        });
        databaseBuilder.factory.buildCertificationVersion({
          id: 3,
          scope: SCOPES.PIX_PLUS_PRO_SANTE,
          startDate: new Date('1988-10-19'),
          expirationDate: null,
          assessmentDuration: 100,
          challengesConfiguration: { maximumAssessmentLength: 2 },
          minimumAnswersRequiredToValidateACertification: 1,
        });
        databaseBuilder.factory.buildCertificationVersion({
          id: 2,
          scope: SCOPES.PIX_PLUS_PRO_SANTE,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 200,
          challengesConfiguration: { maximumAssessmentLength: 20 },
          minimumAnswersRequiredToValidateACertification: 10,
        });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.PRO_SANTE);

        // then
        expect(certificationInfos).to.deepEqualArray([
          domainBuilder.certification.configuration.buildCertificationInfo({
            framework: Frameworks.PRO_SANTE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          }),
          domainBuilder.certification.configuration.buildCertificationInfo({
            framework: Frameworks.PRO_SANTE,
            startDate: new Date('1988-10-19'),
            expirationDate: null,
            assessmentDuration: 100,
            minimumAssessmentLength: 1,
            maximumAssessmentLength: 2,
          }),
        ]);
      });
    });

    context('when the required versions are for framework CLEA', function () {
      it('returns an array containing relevant certification info models as if it was for CORE framework', async function () {
        databaseBuilder.factory.buildCertificationVersion({
          id: 1,
          scope: SCOPES.PIX_PLUS_DROIT,
        });
        databaseBuilder.factory.buildCertificationVersion({
          id: 3,
          scope: SCOPES.CORE,
          startDate: new Date('1988-10-19'),
          expirationDate: null,
          assessmentDuration: 100,
          challengesConfiguration: { maximumAssessmentLength: 2 },
          minimumAnswersRequiredToValidateACertification: 1,
        });
        databaseBuilder.factory.buildCertificationVersion({
          id: 2,
          scope: SCOPES.CORE,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 200,
          challengesConfiguration: { maximumAssessmentLength: 20 },
          minimumAnswersRequiredToValidateACertification: 10,
        });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.CLEA);

        // then
        expect(certificationInfos).to.deepEqualArray([
          domainBuilder.certification.configuration.buildCertificationInfo({
            framework: Frameworks.CLEA,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          }),
          domainBuilder.certification.configuration.buildCertificationInfo({
            framework: Frameworks.CLEA,
            startDate: new Date('1988-10-19'),
            expirationDate: null,
            assessmentDuration: 100,
            minimumAssessmentLength: 1,
            maximumAssessmentLength: 2,
          }),
        ]);
      });
    });
  });
});
