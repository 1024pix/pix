import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class CertificationVersion extends Model {
  @attr('date') startDate;
  @attr('date') expirationDate;
  @attr('number') assessmentDuration;
  @attr('number') minimumAnswersRequiredForValidation;
  @attr('number') maximumAssessmentLength;
  @attr('number') challengesBetweenSameCompetence;
  @attr('number') defaultProbabilityToPickChallenge;
  @attr('number') variationPercent;
  @attr('number') defaultCandidateCapacity;
  @attr('boolean') limitToOneQuestionPerTube;
  @attr('boolean') enablePassageByAllCompetences;
  @attr('string') status;
  @attr('string') scope;
  @attr('string') comments;
  @attr('number') externalCalibrationId;
  @attr({
    defaultValue: () => ([{
      max: -7,
      min: -8,
      index:0,
     },
     {
       max: -5,
       min: -7,
       index:1,

      },
      {
        max: -2,
        min: -5,
        index:2,

       },
       {
         max: 0,
         min: -2,
         index:3,

        },
        {
          max: 3,
          min: 0,
          index:4,

         },
    ]),
  }) globalScoringConfiguration;

  @hasMany('area', { async: false, inverse: null }) areas;

  get isDraft() {
    return this.status === 'draft';
  }
}
