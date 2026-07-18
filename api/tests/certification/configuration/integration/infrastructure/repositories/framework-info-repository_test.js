import * as frameworkInfoRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/framework-info-repository.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | FrameworkInfo', function () {
  describe('#findAll', function () {
    it('returns all the framework info models for all frameworks', async function () {
      // given
      const coreFrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withActiveVersion({
          startDate: new Date('2021-01-01'),
          assessmentDuration: 1,
          maximumAssessmentLength: 1,
        })
        .withParameters({ scope: SCOPES.CORE })
        .insertToDB({ databaseBuilder });
      const proSanteFrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withActiveVersion({
          startDate: new Date('2022-02-02'),
          assessmentDuration: 2,
          maximumAssessmentLength: 2,
        })
        .withArchivedVersion({
          startDate: new Date('2022-01-01'),
          expirationDate: new Date('2022-02-02'),
          assessmentDuration: 3,
          maximumAssessmentLength: 3,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_PRO_SANTE })
        .insertToDB({ databaseBuilder });
      const droitFrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withDraftVersion({
          startDate: new Date('2024-02-02'),
          assessmentDuration: 4,
          maximumAssessmentLength: 4,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_DROIT })
        .insertToDB({ databaseBuilder });
      const edu1FrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE })
        .insertToDB({ databaseBuilder });
      const edu2FrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_2ND_DEGRE })
        .insertToDB({ databaseBuilder });
      const eduCpeFrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_CPE })
        .insertToDB({ databaseBuilder });
      const cleaFrameworkInfo = domainBuilder.certification.configuration
        .buildFrameworkInfo()
        .withParameters({ scope: Frameworks.CLEA })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const allFrameworksInfo = await frameworkInfoRepository.findAll();

      // then
      expect(allFrameworksInfo).to.deepEqualArray([
        cleaFrameworkInfo,
        coreFrameworkInfo,
        droitFrameworkInfo,
        edu1FrameworkInfo,
        edu2FrameworkInfo,
        eduCpeFrameworkInfo,
        proSanteFrameworkInfo,
      ]);
    });
  });
});
