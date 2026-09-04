import { JSONAPICache } from '@warp-drive/json-api';
import { useLegacyStore } from '@warp-drive/legacy';

import { JsonHandler } from '../handlers/json-handler';
import { TransformRequest } from '../handlers/transform-request';
import { TransformResponse } from '../handlers/transform-response';

export default useLegacyStore({
  linksMode: false,
  cache: JSONAPICache,
  handlers: [JsonHandler, TransformRequest, TransformResponse],
  schemas: [],
});
