import Model, { attr }  from '@ember-data/model';

export default class TargetProfile extends Model {

  @attr('string') name;

}

