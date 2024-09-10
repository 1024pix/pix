import { OpenFeature } from '@openfeature/server-sdk';

import { PixEnvVarProvider } from './pix-env-var-provider.js';

await OpenFeature.setProviderAndWait(new PixEnvVarProvider());

const featureToggles = OpenFeature.getClient();

export { featureToggles };
