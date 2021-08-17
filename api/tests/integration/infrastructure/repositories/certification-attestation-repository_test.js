const { expect, databaseBuilder, domainBuilder, catchErr, learningContentBuilder, mockLearningContent } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const { badgeKeyV1: cleaBadgeKeyV1, badgeKeyV2: cleaBadgeKeyV2 } = require('../../../../lib/domain/models/CleaCertificationResult');
const _ = require('lodash');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const certificationAttestationRepository = require('../../../../lib/infrastructure/repositories/certification-attestation-repository');

describe('Integration | Infrastructure | Repository | Certification Attestation', () => {

  const minimalLearningContent = [{
    id: 'recArea0',
    code: '1',
    competences: [{
      id: 'recNv8qhaY887jQb2',
      index: '1.3',
      name: 'Traiter des données',
    }],
  }];

  describe('#get', () => {

    it('should throw a NotFoundError when certification attestation does not exist', async () => {
      // when
      const error = await catchErr(certificationAttestationRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification has no assessment-result', async () => {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildIncomplete(certificationAttestationData);

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is cancelled', async () => {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildCancelled(certificationAttestationData);

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is not published', async () => {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is rejected', async () => {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildRejected(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should return a CertificationAttestation', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
    });

    it('should return a CertificationAttestation with appropriate result competence tree', async () => {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };

      const assessmentResultId = await _buildValidCertificationAttestation(certificationAttestationData, false);

      const competenceMarks1 = domainBuilder.buildCompetenceMark({
        id: 1234,
        level: 4,
        score: 32,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'recComp1',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

      const competenceMarks2 = domainBuilder.buildCompetenceMark({
        id: 4567,
        level: 5,
        score: 40,
        area_code: '1',
        competence_code: '1.2',
        competenceId: 'recComp2',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

      await databaseBuilder.commit();

      const competence1 = domainBuilder.buildCompetence({
        id: 'recComp1',
        index: '1.1',
        name: 'Traiter des données',
      });
      const competence2 = domainBuilder.buildCompetence({
        id: 'recComp2',
        index: '1.2',
        name: 'Traiter des choux',
      });
      const area1 = domainBuilder.buildArea({
        id: 'recArea1',
        code: '1',
        competences: [competence1, competence2],
        title: 'titre test',
      });

      const learningContentObjects = learningContentBuilder.buildLearningContent([{ ...area1, titleFr: area1.title }]);
      mockLearningContent(learningContentObjects);

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedResultCompetenceTree = domainBuilder.buildResultCompetenceTree({
        id: `123-${assessmentResultId}`,
        competenceMarks: [competenceMarks1, competenceMarks2],
        competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
      });
      expect(certificationAttestation.resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);
    });

    it('should take into account the latest validated assessment result of the certification', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestation);
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation).to.deep.equal(expectedCertificationAttestation);
    });

    it('should get the clea certification result if badge V1 taken', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: certificationAttestationRepository.macaronCleaPath,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _buildCleaResult({ certificationCourseId: 123, acquired: true, cleaBadgeKey: cleaBadgeKeyV1 });
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
    });

    it('should get the clea certification result if badge V2 taken', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: certificationAttestationRepository.macaronCleaPath,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _buildCleaResult({ certificationCourseId: 123, acquired: true, cleaBadgeKey: cleaBadgeKeyV2 });
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
    });

    context('acquired certifiable badges', () => {

      it('should get the certified badge images of pixPlusDroitExpert when acquired', async () => {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: certificationAttestationRepository.macaronPixPlusDroitExpertPath,
          sessionId: 789,
        };
        await _buildValidCertificationAttestation(certificationAttestationData);
        await _buildPixPlusDroitExpertResult({ certificationCourseId: 123, acquired: true });

        // when
        const certificationAttestation = await certificationAttestationRepository.get(123);

        // then
        const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
        expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
      });

      it('should get the certified badge images of pixPlusDroitMaitre when acquired', async () => {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: certificationAttestationRepository.macaronPixPlusDroitMaitrePath,
          sessionId: 789,
        };
        await _buildValidCertificationAttestation(certificationAttestationData);
        await _buildPixPlusDroitMaitreResult({ certificationCourseId: 123, acquired: true });

        // when
        const certificationAttestation = await certificationAttestationRepository.get(123);

        // then
        const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
        expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));

      });

      it('should only take into account acquired ones', async () => {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: certificationAttestationRepository.macaronPixPlusDroitMaitrePath,
          sessionId: 789,
        };
        await _buildValidCertificationAttestation(certificationAttestationData);
        await _buildCleaResult({ certificationCourseId: 123, acquired: false, cleaBadgeKey: cleaBadgeKeyV1 });
        await _buildPixPlusDroitMaitreResult({ certificationCourseId: 123, acquired: true });

        // when
        const certificationAttestation = await certificationAttestationRepository.get(123);

        // then
        const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
        expect(_.omit(certificationAttestation, ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
      });
    });
  });

  describe('#findByDivisionForScoIsManagingStudentsOrganization', () => {

    it('should return an empty array when there are no certification attestations for given organization', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildOrganization({ id: 456, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 456, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the organization is not SCO IS MANAGING STUDENTS', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SUP', isManagingStudents: false });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the certification does not belong to a schooling registration in the right division', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '5emeG' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return certifications that have no validated assessment-result', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildRejected(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return cancelled certifications', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildCancelled(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return non published certifications', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an array of certification attestations ordered by last name, first name', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationDataA = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: 111,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 777,
      };
      const certificationAttestationDataB = {
        id: 123,
        firstName: 'Laura',
        lastName: 'Gellar',
        birthdate: '1990-01-04',
        birthplace: 'Torreilles',
        isPublished: true,
        userId: 333,
        date: new Date('2019-01-01'),
        verificationCode: 'P-YETANOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre Catalan',
        pixScore: 150,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      const certificationAttestationDataC = {
        id: 789,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 222,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 888,
      };
      await _buildValidCertificationAttestation(certificationAttestationDataA);
      await _buildValidCertificationAttestation(certificationAttestationDataB);
      await _buildValidCertificationAttestation(certificationAttestationDataC);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData: certificationAttestationDataA, organizationId: 123, division: '3emeB' });
      await _linkCertificationAttestationToOrganization({ certificationAttestationData: certificationAttestationDataB, organizationId: 123, division: '3emeB' });
      await _linkCertificationAttestationToOrganization({ certificationAttestationData: certificationAttestationDataC, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      const expectedCertificationAttestationA = domainBuilder.buildCertificationAttestation(certificationAttestationDataA);
      const expectedCertificationAttestationB = domainBuilder.buildCertificationAttestation(certificationAttestationDataB);
      const expectedCertificationAttestationC = domainBuilder.buildCertificationAttestation(certificationAttestationDataC);
      expect(certificationAttestations).to.have.length(3);
      expect(certificationAttestations[0]).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestations[0], ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestationB, ['resultCompetenceTree']));
      expect(certificationAttestations[1]).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestations[1], ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestationC, ['resultCompetenceTree']));
      expect(certificationAttestations[2]).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestations[2], ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestationA, ['resultCompetenceTree']));
    });

    it('should take into account the latest validated assessment result of a certification', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId: 123, division: '3emeB' });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestations[0], ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
    });

    it('should take into account the latest certification of a schooling registration', async () => {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: 123, division: '3emeb' }).id;
      await databaseBuilder.commit();
      const certificationAttestationDataOldest = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      const certificationAttestationDataNewest = {
        id: 456,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 789,
        date: new Date('2021-01-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien maigrelettes',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      await _buildValidCertificationAttestation(certificationAttestationDataOldest);
      await _buildValidCertificationAttestation(certificationAttestationDataNewest);
      await _linkCertificationAttestationToOrganization({ certificationAttestationData: certificationAttestationDataOldest, organizationId: 123, schoolingRegistrationId });
      await _linkCertificationAttestationToOrganization({ certificationAttestationData: certificationAttestationDataNewest, organizationId: 123, schoolingRegistrationId });

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId: 123, division: '3emeB' });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(certificationAttestationDataNewest);
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.be.instanceOf(CertificationAttestation);
      expect(_.omit(certificationAttestations[0], ['resultCompetenceTree'])).to.deep.equal(_.omit(expectedCertificationAttestation, ['resultCompetenceTree']));
    });
  });
});

async function _buildIncomplete(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
  await databaseBuilder.commit();
}

async function _buildRejected(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
  });
  await databaseBuilder.commit();
}

async function _buildCancelled(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: true,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
  });
  await databaseBuilder.commit();
}

async function _buildValidCertificationAttestation(certificationAttestationData, buildCompetenceMark = true) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return assessmentResultId;
}

async function _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
  const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;
  const assessmentResultId2 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore + 20,
    status: 'validated',
    createdAt: new Date('2020-01-01'),
  }).id;
  const assessmentResultId3 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: 0,
    status: 'rejected',
    createdAt: new Date('2020-01-03'),
  }).id;

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId2,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId3,
  });

  await databaseBuilder.commit();
}

async function _buildCleaResult({ certificationCourseId, acquired, cleaBadgeKey }) {
  databaseBuilder.factory.buildBadge({ key: cleaBadgeKey });
  databaseBuilder.factory.buildBadge({ key: 'some-other-badge-c' });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: cleaBadgeKey, acquired });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: 'some-other-badge-c', acquired: true });
  await databaseBuilder.commit();
}

async function _buildPixPlusDroitExpertResult({ certificationCourseId, acquired }) {
  databaseBuilder.factory.buildBadge({ key: pixPlusDroitExpertBadgeKey });
  databaseBuilder.factory.buildBadge({ key: 'some-other-badge-e' });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: pixPlusDroitExpertBadgeKey, acquired });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: 'some-other-badge-e', acquired: true });
  await databaseBuilder.commit();
}

async function _buildPixPlusDroitMaitreResult({ certificationCourseId, acquired }) {
  databaseBuilder.factory.buildBadge({ key: pixPlusDroitMaitreBadgeKey });
  databaseBuilder.factory.buildBadge({ key: 'some-other-badge-m' });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: pixPlusDroitMaitreBadgeKey, acquired });
  databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: 'some-other-badge-m', acquired: true });
  await databaseBuilder.commit();
}

async function _linkCertificationAttestationToOrganization({ certificationAttestationData, organizationId, division, schoolingRegistrationId = null }) {
  const srId = schoolingRegistrationId || databaseBuilder.factory.buildSchoolingRegistration({
    organizationId,
    userId: certificationAttestationData.userId,
    division,
  }).id;
  databaseBuilder.factory.buildCertificationCandidate({
    userId: certificationAttestationData.userId,
    sessionId: certificationAttestationData.sessionId,
    schoolingRegistrationId: srId,
  });
  await databaseBuilder.commit();
}
