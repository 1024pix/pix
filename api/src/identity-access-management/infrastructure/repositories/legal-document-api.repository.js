import * as legalDocumentApi from '../../../legal-documents/application/api/legal-documents-api.js';

const acceptPixAppTos = async ({ userId, dependencies = { legalDocumentApi } }) => {
  return dependencies.legalDocumentApi.acceptLegalDocumentByUserId({ userId, service: 'pix-app', type: 'TOS' });
};

const acceptPixOrgaTos = async ({ userId, dependencies = { legalDocumentApi } }) => {
  return dependencies.legalDocumentApi.acceptLegalDocumentByUserId({ userId, service: 'pix-orga', type: 'TOS' });
};

const getPixAppTosStatus = async ({ userId, dependencies = { legalDocumentApi } }) => {
  return dependencies.legalDocumentApi.getLegalDocumentStatusByUserId({ userId, service: 'pix-app', type: 'TOS' });
};

const getPixOrgaTosStatus = async ({ userId, dependencies = { legalDocumentApi } }) => {
  return dependencies.legalDocumentApi.getLegalDocumentStatusByUserId({
    userId,
    service: 'pix-orga',
    type: 'TOS',
  });
};

export const legalDocumentApiRepository = {
  acceptPixAppTos,
  acceptPixOrgaTos,
  getPixAppTosStatus,
  getPixOrgaTosStatus,
};
