import { service } from '@ember/service';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';
import ENV from 'pix-orga/config/environment';

import type Store from '../services/store';
import type NullableStringTransform from '../transforms/nullable-string';
import type NullableTextTransform from '../transforms/nullable-text';
import type Badge from './badge';
import type CampaignCollectiveResult from './campaign-collective-result';
import type CampaignResultLevelsPerTubesAndCompetence from './campaign-result-levels-per-tubes-and-competence';
import type CombinedCourseBlueprint from './combined-course-blueprint';
import type Course from './course';
import type Division from './division';
import type Group from './group';
import type Organization from './organization';
import type Stage from './stage';
import type TargetProfile from './target-profile';

interface CampaignAdapter {
  archive(campaign: Campaign): Promise<unknown>;
  unarchive(campaign: Campaign): Promise<unknown>;
}

interface StoreWithCampaignAdapter {
  adapterFor(modelName: 'campaign'): CampaignAdapter;
}

export default class Campaign extends Model {
  declare [Type]: 'campaign';

  @service declare store: InstanceType<typeof Store>;

  @attr<NullableStringTransform>('nullable-string') declare name: string | null;
  @attr<StringTransform>('string') declare code: string | null;
  @attr<StringTransform>('string') declare type: string | null;
  @attr<NullableStringTransform>('nullable-string') declare title: string | null;
  @attr<BooleanTransform>('boolean') declare isArchived: boolean | null;
  @attr<BooleanTransform>('boolean') declare multipleSendings: boolean | null;
  @attr<NullableStringTransform>('nullable-string') declare externalIdLabel: string | null;
  @attr<StringTransform>('string') declare externalIdType: string | null;
  @attr<NullableTextTransform>('nullable-text') declare customLandingPageText: string | null;
  @attr<NumberTransform>('number') declare ownerId: number | null;
  @attr<StringTransform>('string') declare ownerLastName: string | null;
  @attr<StringTransform>('string') declare ownerFirstName: string | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<StringTransform>('string') declare targetProfileId: string | null;
  @attr<StringTransform>('string') declare targetProfileDescription: string | null;
  @attr<StringTransform>('string') declare targetProfileName: string | null;
  @attr<NumberTransform>('number') declare targetProfileTubesCount: number | null;
  @attr<NumberTransform>('number') declare targetProfileThematicResultCount: number | null;
  @attr<BooleanTransform>('boolean') declare targetProfileHasStage: boolean | null;
  @attr<BooleanTransform>('boolean') declare targetProfileAreKnowledgeElementsResettable: boolean | null;
  @attr<BooleanTransform>('boolean') declare isFromCombinedCourse: boolean | null;
  @attr() declare combinedCourse: { id: number; name: string } | null;
  @attr<NumberTransform>('number') declare participationsCount: number | null;
  @attr<NumberTransform>('number') declare sharedParticipationsCount: number | null;
  @attr<NumberTransform>('number') declare averageResult: number | null;
  @attr<NumberTransform>('number') declare totalStage: number | null;
  @attr<NumberTransform>('number') declare reachedStage: number | null;

  @belongsTo('organization', { async: true, inverse: 'campaigns' }) declare organization: AsyncBelongsTo<Organization>;
  @belongsTo('target-profile', { async: true, inverse: null })
  declare targetProfile: AsyncBelongsTo<TargetProfile>;
  @belongsTo('combined-course-blueprint', { async: true, inverse: null })
  declare combinedCourseBlueprint: AsyncBelongsTo<CombinedCourseBlueprint>;

  @belongsTo<Course>('course', { async: false, inverse: null }) declare course: Course | null;

  @belongsTo<CampaignCollectiveResult>('campaign-collective-result', { async: true, inverse: null })
  declare campaignCollectiveResult: AsyncBelongsTo<CampaignCollectiveResult>;
  @belongsTo<CampaignResultLevelsPerTubesAndCompetence>('campaign-result-levels-per-tubes-and-competence', {
    async: true,
    inverse: null,
  })
  declare campaignResultLevelsPerTubesAndCompetence: AsyncBelongsTo<CampaignResultLevelsPerTubesAndCompetence>;

  @hasMany('badge', { async: true, inverse: null }) declare badges: AsyncHasMany<Badge>;
  @hasMany('stage', { async: true, inverse: null }) declare stages: AsyncHasMany<Stage>;
  @hasMany<Division>('division', { async: true, inverse: null }) declare divisions: AsyncHasMany<Division>;
  @hasMany<Group>('group', { async: true, inverse: null }) declare groups: AsyncHasMany<Group>;

  get hasBadges(): boolean {
    return (this.targetProfileThematicResultCount ?? 0) > 0;
  }

  get hasExternalId(): boolean {
    return Boolean(this.externalIdLabel);
  }

  get hasStages(): boolean | null {
    return this.targetProfileHasStage;
  }

  get ownerFullName(): string {
    return `${this.ownerFirstName} ${this.ownerLastName}`;
  }

  get isProfilesCollection(): boolean {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment(): boolean {
    return this.type === 'ASSESSMENT';
  }

  get isTypeCombinedCourse(): boolean {
    return this.type === 'COMBINED_COURSE';
  }

  get isTypeExam(): boolean {
    return this.type === 'EXAM';
  }

  get urlToResult(): string {
    if (this.isTypeAssessment || this.isTypeExam) {
      return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-assessment-results`;
    }
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-profiles-collection-results`;
  }

  get hasParticipations(): boolean {
    return (this.participationsCount ?? 0) > 0;
  }

  get hasSharedParticipations(): boolean {
    return (this.sharedParticipationsCount ?? 0) > 0;
  }

  async archive(): Promise<Campaign> {
    await (this.store as unknown as StoreWithCampaignAdapter).adapterFor('campaign').archive(this);
    return this.store.findRecord<Campaign>('campaign', this.id as string);
  }

  async unarchive(): Promise<Campaign> {
    await (this.store as unknown as StoreWithCampaignAdapter).adapterFor('campaign').unarchive(this);
    return this.store.findRecord<Campaign>('campaign', this.id as string);
  }

  setType(type: string): void {
    if (['ASSESSMENT', 'EXAM'].includes(type)) {
      this.course = this.course?.type === 'blueprint' ? null : this.course;
    }
    if (type === 'PROFILES_COLLECTION') {
      this.multipleSendings = true;
      this.title = null;
      this.targetProfileId = null;
      this.course = null;
    }
    if (type === 'COMBINED_COURSE') {
      this.course = this.course?.type === 'targetProfile' ? null : this.course;
    }
    this.type = type;
  }
}
