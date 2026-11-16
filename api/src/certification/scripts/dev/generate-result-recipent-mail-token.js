import { tokenService } from '../../../shared/domain/services/token-service.js';

const token = tokenService.encodeToken(
  {
    session_id: process.argv[2],
    result_recipient_email: process.argv[3],
    scope: 'certificationResultsByRecipientEmailLink',
  },
  process.argv[4],
  '300d',
);
process.stdout.write(token);
