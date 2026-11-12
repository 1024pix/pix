import { expect } from 'chai';

import { UserCertificationResult } from '../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import * as newCertificationResultRepository from '../../../../../../src/certification/results/infrastructure/repositories/new-certification-result-repository.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Integration | Infrastructure | Repository | New Certification Result', function () {
  describe('#save', function () {
    let certificationResultData1, certificationResultData2, certificationResultData3;
    let userCertificationResultData1, userCertificationResultData2, userCertificationResultData3;
    beforeEach(function () {
      certificationResultData1 = {
        id: '10000001-1001-1001-1001-100000000001',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Buffy',
        middleName: null,
        thirdName: null,
        lastName: 'Summers',
        externalId: null,
        nationalStudentId: 'some student id',
        birthdate: '1981-01-18',
        birthplace: 'Sunnydale',
        birthPostalCode: null,
        birthINSEECode: '99001',
        birthCountry: 'États-Unis',
        verificationCode: 'VERIFCODE',
        certificationCenter: 'Centre certification le meilleur',
        startedAt: new Date('2025-12-30'),
        deliveredAt: new Date('2025-12-31'),
        status: 'validated',
        framework: Frameworks.CORE,
        franceCompetencesMinScore: 120,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        maxReachableLevel: 7,
        pixScore: 678,
        reachedMeshIndex: 3,
        competenceMarks: [
          {
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
        eduV3ExternalJuryResult: null,
        hasAcquiredClea: null,
        cleaBadgeId: null,
      };
      certificationResultData2 = {
        id: '20000002-2002-2002-2002-200000000002',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Rupert',
        middleName: 'Ru',
        thirdName: 'Pert',
        lastName: 'Giles',
        externalId: 'MagicBox',
        nationalStudentId: null,
        birthdate: '1956-02-22',
        birthplace: 'Pézila-la-rivière',
        birthPostalCode: '66370',
        birthINSEECode: null,
        birthCountry: 'France',
        verificationCode: 'CODEVERIF',
        certificationCenter: 'Centre certification anglais',
        startedAt: new Date('2026-11-01'),
        deliveredAt: new Date('2026-12-01'),
        status: 'cancelled',
        framework: Frameworks.EDU_CPE,
        franceCompetencesMinScore: null,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        eduV3ExternalJuryResult: 'REALLY BAD',
        reachedMeshIndex: 2,
        maxReachableLevel: null,
        pixScore: null,
        competenceMarks: null,
        hasAcquiredClea: null,
        cleaBadgeId: null,
      };
      certificationResultData3 = {
        id: '30000003-3003-3003-3003-300000000003',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Mamie',
        middleName: 'Ma',
        thirdName: null,
        lastName: 'Nova',
        externalId: null,
        nationalStudentId: null,
        birthdate: '1956-02-22',
        birthplace: 'Kelkepart',
        birthPostalCode: null,
        birthINSEECode: '66170',
        birthCountry: 'France',
        verificationCode: 'CODEVERIF3',
        certificationCenter: 'Centre certification de la campagne',
        startedAt: new Date('2026-11-01'),
        deliveredAt: new Date('2026-12-01'),
        status: 'validated',
        framework: Frameworks.CLEA,
        franceCompetencesMinScore: 123,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        maxReachableLevel: 7,
        pixScore: 123,
        reachedMeshIndex: 2,
        competenceMarks: [
          {
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
        hasAcquiredClea: true,
        cleaBadgeId: 444,
        eduV3ExternalJuryResult: null,
      };
      userCertificationResultData1 = {
        certificationResultId: '10000001-1001-1001-1001-100000000001',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: databaseBuilder.factory.buildSession().id,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
      };
      userCertificationResultData2 = {
        certificationResultId: '20000002-2002-2002-2002-200000000002',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: null,
        certificationCourseId: null,
      };
      userCertificationResultData3 = {
        certificationResultId: '30000003-3003-3003-3003-300000000003',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: databaseBuilder.factory.buildSession().id,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
      };
      return databaseBuilder.commit();
    });

    it('saves both CertificationResults and UserCertificationResults', async function () {
      const certificationResult1 =
        domainBuilder.certification.results.buildNewCertificationResult(certificationResultData1);
      const certificationResult2 =
        domainBuilder.certification.results.buildNewCertificationResult(certificationResultData2);
      const certificationResult3 =
        domainBuilder.certification.results.buildNewCertificationResult(certificationResultData3);
      const userCertificationResults1 = new UserCertificationResult(userCertificationResultData1);
      const userCertificationResults2 = new UserCertificationResult(userCertificationResultData2);
      const userCertificationResults3 = new UserCertificationResult(userCertificationResultData3);

      await newCertificationResultRepository.save({
        certificationResults: [certificationResult1, certificationResult2, certificationResult3],
        userCertificationResults: [userCertificationResults1, userCertificationResults2, userCertificationResults3],
      });

      const actualUserCertificationResults = await knex('user_certification_results')
        .select('*')
        .orderBy('certificationResultId');
      expect(actualUserCertificationResults).to.deep.equal([
        userCertificationResultData1,
        userCertificationResultData2,
        userCertificationResultData3,
      ]);
      const actualCertificationResults = await knex('certification_results').select('*').orderBy('id');
      expect(actualCertificationResults).to.deep.equal([
        certificationResultData1,
        certificationResultData2,
        certificationResultData3,
      ]);
    });

    it('does nothing when nothing to save', async function () {
      await newCertificationResultRepository.save({
        certificationResults: [],
        userCertificationResults: [],
      });

      const actualUserCertificationResults = await knex('user_certification_results')
        .select('*')
        .orderBy('certificationResultId');
      expect(actualUserCertificationResults).to.have.lengthOf(0);
      const actualCertificationResults = await knex('certification_results').select('*').orderBy('id');
      expect(actualCertificationResults).to.have.lengthOf(0);
    });
  });
});
