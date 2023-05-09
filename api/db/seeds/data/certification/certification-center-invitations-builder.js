import { SUP_CERTIF_CENTER_ID } from './certification-centers-builder.js';

function certificationCenterInvitationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenterInvitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    email: 'alain.verse@example.net',
    status: 'pending',
  });

  databaseBuilder.factory.buildCertificationCenterInvitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    email: 'akim.embett@example.net',
    status: 'pending',
  });

  databaseBuilder.factory.buildCertificationCenterInvitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    email: 'alex.terrieur@example.net',
    status: 'accepted',
  });

  databaseBuilder.factory.buildCertificationCenterInvitation({
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    email: 'aline.eha@example.net',
    status: 'cancelled',
  });
}

export { certificationCenterInvitationsBuilder };
