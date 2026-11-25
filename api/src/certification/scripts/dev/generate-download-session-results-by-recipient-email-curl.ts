/**
 * Dev tool: prints a ready-to-use curl command to call GET /api/sessions/download-results/{token}
 * (see CertificationResultsLinkByEmailToken).
 *
 * The secret is required on purpose: the script never falls back on the environment secret.
 *
 * Usage:
 *   node src/certification/scripts/dev/generate-download-session-results-by-recipient-email-curl.ts --secret <AUTH_SECRET> --sessionId 123 --resultRecipientEmail recipient@example.net
 */
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { tokenService } from '../../../shared/domain/services/token-service.js';

const SCOPE = 'certificationResultsByRecipientEmailLink';
const EXPIRES_IN = '5d';

const { secret, sessionId, resultRecipientEmail, apiUrl } = await yargs(hideBin(process.argv))
  .usage(
    'Prints a curl command to download the certification results of a session for one result recipient email, as CSV',
  )
  .options({
    secret: { type: 'string', demandOption: true, describe: 'Secret used to sign the token (AUTH_SECRET)' },
    sessionId: { type: 'number', demandOption: true, describe: 'Id of the session' },
    resultRecipientEmail: { type: 'string', demandOption: true, describe: 'Email of the results recipient' },
    apiUrl: { type: 'string', default: 'http://localhost:3000', describe: 'Base URL of the API' },
  })
  .strict()
  .help()
  .version(false)
  .parseAsync();

const token = tokenService.encodeToken(
  { session_id: sessionId, result_recipient_email: resultRecipientEmail, scope: SCOPE },
  secret,
  EXPIRES_IN,
);

process.stdout.write(`curl '${apiUrl}/api/sessions/download-results/${token}'\n`);
