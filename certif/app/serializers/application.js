import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  // This bypasses extractErrors emberData behavior which relies on the property being a function.
  // Still required with WarpDrive: @warp-drive/legacy's compat layer still checks
  // `typeof serializer.extractErrors === 'function'` (marked as deprecated but not yet removed).
  extractErrors = false;
}
