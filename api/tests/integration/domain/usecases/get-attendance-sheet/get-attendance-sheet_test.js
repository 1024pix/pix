import { promises } from 'fs';

const { unlink: unlink, writeFile: writeFile } = promises;

import _ from 'lodash';
import { expect, databaseBuilder } from '../../../../test-helper';
import readOdsUtils from '../../../../../lib/infrastructure/utils/ods/read-ods-utils';
import sessionRepository from '../../../../../lib/infrastructure/repositories/sessions/session-repository';
import sessionForAttendanceSheetRepository from '../../../../../lib/infrastructure/repositories/sessions/session-for-attendance-sheet-repository';
import getAttendanceSheet from '../../../../../lib/domain/usecases/get-attendance-sheet';

describe('Integration | UseCases | getAttendanceSheet', function () {
  describe('when certification center is not sco', function () {
    let userId;
    let sessionId;
    let certificationCenterId;

    const expectedOdsFilePath = `${__dirname}/non_sco_attendance_sheet_template_target.ods`;
    const actualOdsFilePath = `${__dirname}/non_sco_attendance_sheet_template_actual.tmp.ods`;

    beforeEach(async function () {
      const certificationCenterName = 'Centre de certification';
      databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234', isManagingStudents: false });
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: 'SUP',
        externalId: 'EXT1234',
      }).id;

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;

      _createCertificationCandidatesForSession(sessionId);

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await unlink(actualOdsFilePath);
    });

    it('should return an attendance sheet with session data, certification candidates data prefilled', async function () {
      // when
      const updatedOdsFileBuffer = await getAttendanceSheet({
        userId,
        sessionId,
        sessionRepository,
        sessionForAttendanceSheetRepository,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });

  describe('when certification center is sco and managing students', function () {
    let userId;
    let sessionId;
    let certificationCenterId;

    const expectedOdsFilePath = `${__dirname}/sco_attendance_sheet_template_target.ods`;
    const actualOdsFilePath = `${__dirname}/sco_attendance_sheet_template_actual.tmp.ods`;

    beforeEach(async function () {
      const certificationCenterName = 'Centre de certification';
      databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'EXT1234', isManagingStudents: true });
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: 'SCO',
        externalId: 'EXT1234',
      }).id;

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;
      _createCertificationCandidatesScoForSession(sessionId);

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await unlink(actualOdsFilePath);
    });

    it('should return an attendance sheet with session data, certification candidates data prefilled', async function () {
      // when
      const updatedOdsFileBuffer = await getAttendanceSheet({
        userId,
        sessionId,
        sessionRepository,
        sessionForAttendanceSheetRepository,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });
});

function _createCertificationCandidatesScoForSession(sessionId) {
  _.each(
    [
      {
        lastName: 'Jackson',
        firstName: 'Michael',
        birthdate: '2004-04-04',
        sessionId,
        division: '2C',
        extraTimePercentage: 0.6,
      },
      {
        lastName: 'Jackson',
        firstName: 'Janet',
        birthdate: '2005-12-05',
        sessionId,
        division: '3B',
        extraTimePercentage: null,
      },
      {
        lastName: 'Mercury',
        firstName: 'Freddy',
        birthdate: '1925-06-28',
        sessionId,
        division: '1A',
        extraTimePercentage: 1.5,
      },
      {
        lastName: 'Gallagher',
        firstName: 'Jack',
        birthdate: '1980-08-10',
        sessionId,
        division: '3B',
        extraTimePercentage: 0.15,
      },
    ],
    (candidate) => {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner(candidate).id;
      databaseBuilder.factory.buildCertificationCandidate({ ...candidate, organizationLearnerId });
    }
  );
}

function _createCertificationCandidatesForSession(sessionId) {
  _.each(
    [
      {
        lastName: 'Jackson',
        firstName: 'Michael',
        birthdate: '2004-04-04',
        sessionId,
        externalId: 'ABC123',
        extraTimePercentage: 0.6,
      },
      {
        lastName: 'Jackson',
        firstName: 'Janet',
        birthdate: '2005-12-05',
        sessionId,
        externalId: 'DEF456',
        extraTimePercentage: null,
      },
      {
        lastName: 'Mercury',
        firstName: 'Freddy',
        birthdate: '1925-06-28',
        sessionId,
        externalId: 'GHI789',
        extraTimePercentage: 1.5,
      },
      {
        lastName: 'Gallagher',
        firstName: 'Jack',
        birthdate: '1980-08-10',
        sessionId,
        externalId: null,
        extraTimePercentage: 0.15,
      },
    ],
    (candidate) => {
      databaseBuilder.factory.buildCertificationCandidate(candidate);
    }
  );
}
