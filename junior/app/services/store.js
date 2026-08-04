import { JSONAPICache } from '@warp-drive/json-api';
import { useLegacyStore } from '@warp-drive/legacy';

import { JsonHandler } from '../handlers/json-handler';
import { TransformResponse } from '../handlers/transform-response';

export default useLegacyStore({
  linksMode: false,
  cache: JSONAPICache,
  handlers: [JsonHandler, TransformResponse],
  schemas: [],
});
