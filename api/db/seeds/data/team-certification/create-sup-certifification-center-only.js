import { CertificationCenter } from '../../../../src/shared/domain/models/index.js';
import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import { SUP_CERTIFICATION_CENTER_ID, SUP_EXTERNAL_ID, V3_CERTIFICATION_CENTER_USER_ID } from './constants.js';

export async function supCertificationCenterOnly({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: V3_CERTIFICATION_CENTER_USER_ID,
    firstName: 'membre sup certif only',
    lastName: 'Certification',
    email: 'sup-center-member@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, V3_CERTIFICATION_CENTER_USER_ID);

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: SUP_CERTIFICATION_CENTER_ID,
    name: 'Centre de certification v3 pro pilote pour la séparation pix/pix+',
    type: CertificationCenter.types.PRO,
    externalId: SUP_EXTERNAL_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: V3_CERTIFICATION_CENTER_USER_ID }],
  });
}
