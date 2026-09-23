import { COMBINED_COURSE_ITEM_TYPES } from '../../../constants.js';

class CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    duration,
    image,
    isLocked = true,
  }) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.redirection = redirection;
    this.participationStatus = participationStatus;
    this.isCompleted = isCompleted;
    this.isLocked = isLocked;
    this.duration = duration;
    this.image = image;
  }
}

/* TODO
- description : Training = null / Campaign = customLandingPageText / Module = description
- objectifs : Training = null / Campaign = null / Module = objectives
- level : Training = null / Campaign = null / Module = level

==> Données à faire remonter de la table campaigns et des modules de learning-content dans les repos associés
(Campagnes : api/src/quest/infrastructure/repositories/combined-courses/campaign-repository.js
Modules api/src/quest/infrastructure/repositories/combined-courses/module-repository.js -> api/src/devcomp/infrastructure/repositories/module-metadata-repository.js)

Ajouter ces infos dans nos VOs Campaign et Module.

Les passer à CampaignCombinedCourseItem et à ModuleCombinedCourseItem via les méthodes de CombinedCourseDetails
(#createCampaignCombinedCourseItem / #createModuleCombinedCourseItem)

Ajouter à la sérialisation : api/src/quest/infrastructure/serializers/combined-course-serializer.js
 */

export class TrainingCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    duration,
    image,
    isLocked = true,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.FORMATION;
  }
}

export class CampaignCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    isLocked,
    duration,
    image,
    masteryRate = null,
    totalStagesCount = null,
    validatedStagesCount = null,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.CAMPAIGN;
  }
}

export class ModuleCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    isLocked,
    duration,
    image,
    shortId,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
    this.shortId = shortId;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
