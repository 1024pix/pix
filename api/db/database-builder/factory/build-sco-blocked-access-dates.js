import { ScoOrganizationTagName } from '../../../src/certification/configuration/domain/models/ScoOrganizationTagName.js';
import { databaseBuffer } from '../database-buffer.ts';

export function buildScoBlockedAccessDate({ reopeningDate = new Date('2025-11-15'), scoOrganizationTagName }) {
  databaseBuffer.pushInsertable({
    tableName: 'certification_sco_blocked_access_dates',
    values: {
      scoOrganizationTagName,
      reopeningDate,
    },
  });
}

export function buildCollegeScoBlockedAccessDate(reopeningDate = new Date('2025-11-15')) {
  buildScoBlockedAccessDate({
    reopeningDate,
    scoOrganizationTagName: ScoOrganizationTagName.COLLEGE,
  });
}

export function buildLyceeScoBlockedAccessDate(reopeningDate = new Date('2025-10-15')) {
  buildScoBlockedAccessDate({
    reopeningDate,
    scoOrganizationTagName: ScoOrganizationTagName.LYCEE,
  });
}

export function buildDefaultScoBlockedAccessDates() {
  buildCollegeScoBlockedAccessDate();
  buildLyceeScoBlockedAccessDate();
}
