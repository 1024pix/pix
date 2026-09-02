import { TransformName } from '@warp-drive/core/types/symbols';
import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class DateOnlyTransform extends Transform {
  declare [TransformName]: 'date-only';

  serialize(date: string | null): string | null {
    return date;
  }

  deserialize(date: string | null): string | null {
    const dateRegex = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
    if (date && date.search(dateRegex) === 0) {
      return date;
    }
    return null;
  }
}
