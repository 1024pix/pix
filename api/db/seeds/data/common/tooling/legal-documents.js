import {
  LEGAL_DOCUMENT_PIX_APP_TOS_ID_V1,
  LEGAL_DOCUMENT_PIX_APP_TOS_ID_V2,
  LEGAL_DOCUMENT_PIX_CERTIF_TOS_ID_V1,
  LEGAL_DOCUMENT_PIX_CERTIF_TOS_ID_V2,
  LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V1,
  LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V2,
} from '../constants.js';

export function createPixOrgaTermsOfService(databaseBuilder) {
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V1,
    type: 'TOS',
    service: 'pix-orga',
    versionAt: '2018-01-01',
  });
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V2,
    type: 'TOS',
    service: 'pix-orga',
    versionAt: '2020-01-01',
  });
}

export function acceptPixOrgaTermsOfService(databaseBuilder, userId, cguVersion = 'v2') {
  if (cguVersion === 'v1') {
    databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
      legalDocumentVersionId: LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V1,
      userId,
      acceptedAt: '2019-01-01',
    });
  } else if (cguVersion === 'v2') {
    databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
      legalDocumentVersionId: LEGAL_DOCUMENT_PIX_ORGA_TOS_ID_V2,
      userId,
    });
  }
}

export function createPixAppTermsOfService(databaseBuilder) {
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_APP_TOS_ID_V1,
    type: 'TOS',
    service: 'pix-app',
    versionAt: '2019-01-01',
  });
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_APP_TOS_ID_V2,
    type: 'TOS',
    service: 'pix-app',
    versionAt: '2022-01-01',
  });
}

export function createPixCertifTermsOfService(databaseBuilder) {
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_CERTIF_TOS_ID_V1,
    type: 'TOS',
    service: 'pix-certif',
    versionAt: '2018-01-01',
  });
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: LEGAL_DOCUMENT_PIX_CERTIF_TOS_ID_V2,
    type: 'TOS',
    service: 'pix-certif',
    versionAt: '2021-01-01',
  });
}
