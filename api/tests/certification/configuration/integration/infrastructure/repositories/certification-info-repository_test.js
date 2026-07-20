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
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .withParameters({ framework: Frameworks.CORE })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.PRO_SANTE);

        // then
        expect(certificationInfos).to.be.empty;
      });
    });

    context('when there are some versions for a framework', function () {
      it('returns an array containing relevant certification info models', async function () {
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .withParameters({ framework: SCOPES.PIX_PLUS_DROIT, id: 1 })
          .insertToDB({ databaseBuilder });
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asDraft()
          .withParameters({
            framework: SCOPES.PIX_PLUS_PRO_SANTE,
            assessmentDuration: 100,
            minimumAssessmentLength: 1,
            maximumAssessmentLength: 2,
          })
          .insertToDB({ databaseBuilder });
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asActive()
          .withParameters({
            framework: SCOPES.PIX_PLUS_PRO_SANTE,
            tubeIds: [],
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.PRO_SANTE);

        // then
        expect(certificationInfos).to.deepEqualArray([
          domainBuilder.certification.configuration
            .certificationInfoBuilder()
            .asDraft()
            .withParameters({
              framework: Frameworks.PRO_SANTE,
              assessmentDuration: 100,
              minimumAssessmentLength: 1,
              maximumAssessmentLength: 2,
            })
            .build(),
          domainBuilder.certification.configuration
            .certificationInfoBuilder()
            .asActive()
            .withParameters({
              framework: Frameworks.PRO_SANTE,
              assessmentDuration: 200,
              minimumAssessmentLength: 10,
              maximumAssessmentLength: 20,
            })
            .build(),
        ]);
      });
    });

    context('when the required versions are for framework CLEA', function () {
      it('returns an array containing relevant certification info models as if it was for CORE framework', async function () {
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .withParameters({ framework: SCOPES.PIX_PLUS_DROIT, id: 1 })
          .insertToDB({ databaseBuilder });
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asActive()
          .withParameters({
            framework: SCOPES.CORE,
            assessmentDuration: 100,
            minimumAssessmentLength: 1,
            maximumAssessmentLength: 2,
          })
          .insertToDB({ databaseBuilder });
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asDraft()
          .withParameters({
            framework: SCOPES.CORE,
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const certificationInfos = await findAllByFramework(Frameworks.CLEA);

        // then
        expect(certificationInfos).to.deepEqualArray([
          domainBuilder.certification.configuration
            .certificationInfoBuilder()
            .asActive()
            .withParameters({
              framework: Frameworks.CLEA,
              assessmentDuration: 100,
              minimumAssessmentLength: 1,
              maximumAssessmentLength: 2,
            })
            .build(),
          domainBuilder.certification.configuration
            .certificationInfoBuilder()
            .asDraft()
            .withParameters({
              framework: Frameworks.CLEA,
              assessmentDuration: 200,
              minimumAssessmentLength: 10,
              maximumAssessmentLength: 20,
            })
            .build(),
        ]);
      });
    });
  });
});
