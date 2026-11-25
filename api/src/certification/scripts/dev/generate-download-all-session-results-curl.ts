/**
 * Dev tool: prints a ready-to-use curl command to call POST /api/sessions/download-all-results
 * (see CertificationResultsLinkToken).
 *
 * The secret is required on purpose: the script never falls back on the environment secret.
 *
 * Usage:
 *   node src/certification/scripts/dev/generate-download-all-session-results-curl.ts --secret <AUTH_SECRET> --sessionId 123
 */
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { tokenService } from '../../../shared/domain/services/token-service.js';

const SCOPE = 'certificationResultsLink';
const EXPIRES_IN = '5d';

const { secret, sessionId, apiUrl } = await yargs(hideBin(process.argv))
  .usage('Prints a curl command to download all the certification results of a session as CSV')
  .options({
    secret: { type: 'string', demandOption: true, describe: 'Secret used to sign the token (AUTH_SECRET)' },
    sessionId: { type: 'number', demandOption: true, describe: 'Id of the session' },
    apiUrl: { type: 'string', default: 'http://localhost:3000', describe: 'Base URL of the API' },
  })
  .strict()
  .help()
  .version(false)
  .parseAsync();

const token = tokenService.encodeToken({ session_id: sessionId, scope: SCOPE }, secret, EXPIRES_IN);

process.stdout.write(
  `curl -X POST '${apiUrl}/api/sessions/download-all-results' -H 'Content-Type: application/json' -d '{"token":"${token}"}'\n`,
);
