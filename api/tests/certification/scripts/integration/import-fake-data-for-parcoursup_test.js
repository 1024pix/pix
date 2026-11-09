import { expect } from 'chai';
import sinon from 'sinon';

import { ImportFakeDataForParcoursup } from '../../../../src/certification/scripts/import-fake-data-for-parcoursup.js';
import { datamartBuilder, datamartKnex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Scripts | Integration | ImportFakeDataForParcoursup', function () {
  let script;
  let logger;
  const now = new Date('2025-06-15T12:00:00Z');

  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
    script = new ImportFakeDataForParcoursup();
    logger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
  });

  describe('#handle', function () {
    let jsonData;
    beforeEach(function () {
      jsonData = [
        {
          ine: 'INE123',
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'ZAPATA',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification: 'CODEVERIF1',
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:02:11Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 895,
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: 'Mener une recherche et une veille d’information',
              areaName: 'Informations et données',
              level: 3,
            }),
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.2',
              name: 'Gérer des données',
              areaName: 'Informations et données',
              level: 5,
            }),
          ],
        },
        {
          ine: 'INE456',
          organizationUai: 'UAI ETAB ELEVE 2',
          lastName: 'ALBERTI',
          firstName: 'PRENOM-ELEVE2',
          birthdate: '2010-01-01',
          status: 'cancelled',
          pixScore: null,
          certificationId: 454,
          certificationCodeVerification: 'CODEVERIF2',
          certificationDate: new Date('2025-12-21T09:39:54Z'),
          certificationIssuedAt: new Date('2026-01-01T12:02:11Z'),
          competences: [],
        },
      ];
      const dataAlreadyInDB = {
        nationalStudentId: 'ehwfuiofew',
        organizationUai: 'hgureigfr',
        lastName: 'aaa',
        firstName: 'aaa',
        birthdate: '2021-01-01',
        status: 'aaa',
        pixScore: 123,
        certificationId: 123,
        certificationCodeVerification: 'CODEVERIF',
        certificationDate: new Date(),
        certificationIssuedAt: new Date(),
        maxReachableLevel: 7,
        maxReachablePixScore: 895,
        competenceCode: 'qqq',
        competenceName: 'aaa',
        competenceLevel: 1,
        areaName: 'bbbb',
      };
      datamartBuilder.factory.buildCertificationResult(dataAlreadyInDB);
      datamartBuilder.factory.buildScoCertificationResult(dataAlreadyInDB);
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'certification_results',
        lastUpdatedAt: new Date('2000-01-01'),
      });
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'sco_certification_results',
        lastUpdatedAt: new Date('2000-01-01'),
      });
      return datamartBuilder.commit();
    });

    it('fills certification_results table, empyting it beforehand, with the JSON data', async function () {
      await script.handle({ options: { replicationTarget: 'certification_results', json: jsonData }, logger });

      expect(logger.info).to.have.been.calledOnceWith('Script finished. Number of lines inserted : 3, youpi');
      // sco_certification_results remain unchanged
      const otherReplicationData = await datamartKnex.pluck('last_name').from('sco_certification_results');
      expect(otherReplicationData).to.deep.equal(['aaa']);

      // metadata updated
      const repliMetadata = await datamartKnex.select('*').from('replication_metadata').orderBy('replication_name');
      expect(repliMetadata).to.deep.equal([
        { replication_name: 'certification_results', last_updated_at: now },
        { replication_name: 'sco_certification_results', last_updated_at: new Date('2000-01-01') },
      ]);

      // data imported
      const importedData = await datamartKnex
        .select('*')
        .from('certification_results')
        .orderBy(['certification_courses_id', 'last_name']);
      expect(importedData).to.deep.equal([
        {
          certification_code_verification: 'CODEVERIF2',
          last_name: 'ALBERTI',
          first_name: 'PRENOM-ELEVE2',
          birthdate: '2010-01-01',
          status: 'cancelled',
          pix_score: null,
          certification_date: new Date('2025-12-21T09:39:54Z'),
          competence_level: null,
          competence_name: null,
          competence_code: null,
          area_name: null,
          certification_courses_id: '454',
          certification_issued_at: new Date('2026-01-01T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
        {
          certification_code_verification: 'CODEVERIF1',
          last_name: 'ZAPATA',
          first_name: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pix_score: 327,
          certification_date: new Date('2024-11-22T09:39:54Z'),
          competence_level: 3,
          competence_name: 'Mener une recherche et une veille d’information',
          competence_code: '1.1',
          area_name: 'Informations et données',
          certification_courses_id: '777',
          certification_issued_at: new Date('2024-11-24T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
        {
          certification_code_verification: 'CODEVERIF1',
          last_name: 'ZAPATA',
          first_name: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pix_score: 327,
          certification_date: new Date('2024-11-22T09:39:54Z'),
          competence_level: 5,
          competence_name: 'Gérer des données',
          competence_code: '1.2',
          area_name: 'Informations et données',
          certification_courses_id: '777',
          certification_issued_at: new Date('2024-11-24T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
      ]);
    });

    it('fills sco_certification_results table, empyting it beforehand, with the JSON data', async function () {
      await script.handle({ options: { replicationTarget: 'sco_certification_results', json: jsonData }, logger });

      expect(logger.info).to.have.been.calledOnceWith('Script finished. Number of lines inserted : 3, youpi');
      // sco_certification_results remain unchanged
      const otherReplicationData = await datamartKnex.pluck('last_name').from('certification_results');
      expect(otherReplicationData).to.deep.equal(['aaa']);

      // metadata updated
      const repliMetadata = await datamartKnex.select('*').from('replication_metadata').orderBy('replication_name');
      expect(repliMetadata).to.deep.equal([
        { replication_name: 'certification_results', last_updated_at: new Date('2000-01-01') },
        { replication_name: 'sco_certification_results', last_updated_at: now },
      ]);

      // data imported
      const importedData = await datamartKnex
        .select('*')
        .from('sco_certification_results')
        .orderBy(['certification_courses_id', 'last_name']);
      expect(importedData).to.deep.equal([
        {
          national_student_id: 'INE456',
          organization_uai: 'UAI ETAB ELEVE 2',
          certification_code_verification: 'CODEVERIF2',
          last_name: 'ALBERTI',
          first_name: 'PRENOM-ELEVE2',
          middle_name: null,
          third_name: null,
          birthdate: '2010-01-01',
          status: 'cancelled',
          pix_score: null,
          certification_date: new Date('2025-12-21T09:39:54Z'),
          competence_level: null,
          competence_name: null,
          competence_code: null,
          area_name: null,
          certification_courses_id: '454',
          certification_issued_at: new Date('2026-01-01T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
        {
          national_student_id: 'INE123',
          organization_uai: 'UAI ETAB ELEVE',
          certification_code_verification: 'CODEVERIF1',
          last_name: 'ZAPATA',
          first_name: 'PRENOM-ELEVE',
          middle_name: null,
          third_name: null,
          birthdate: '2000-01-01',
          status: 'validated',
          pix_score: 327,
          certification_date: new Date('2024-11-22T09:39:54Z'),
          competence_level: 3,
          competence_name: 'Mener une recherche et une veille d’information',
          competence_code: '1.1',
          area_name: 'Informations et données',
          certification_courses_id: '777',
          certification_issued_at: new Date('2024-11-24T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
        {
          national_student_id: 'INE123',
          organization_uai: 'UAI ETAB ELEVE',
          certification_code_verification: 'CODEVERIF1',
          last_name: 'ZAPATA',
          first_name: 'PRENOM-ELEVE',
          middle_name: null,
          third_name: null,
          birthdate: '2000-01-01',
          status: 'validated',
          pix_score: 327,
          certification_date: new Date('2024-11-22T09:39:54Z'),
          competence_level: 5,
          competence_name: 'Gérer des données',
          competence_code: '1.2',
          area_name: 'Informations et données',
          certification_courses_id: '777',
          certification_issued_at: new Date('2024-11-24T12:02:11Z'),
          max_reachable_level: 7,
          max_reachable_pix_score: 895,
        },
      ]);
    });
  });
});
