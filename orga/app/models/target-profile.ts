import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class TargetProfile extends Model {
  declare [Type]: 'target-profile';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare description: string | null;
  @attr<NumberTransform>('number') declare tubeCount: number | null;
  @attr<NumberTransform>('number') declare thematicResultCount: number | null;
  @attr<BooleanTransform>('boolean') declare hasStage: boolean | null;
  @attr<StringTransform>('string') declare category: string | null;
  @attr<BooleanTransform>('boolean') declare areKnowledgeElementsResettable: boolean | null;
  @attr<BooleanTransform>('boolean') declare isSimplifiedAccess: boolean | null;
}
