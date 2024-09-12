import { service } from '@ember/service';
import Component from '@glimmer/component';

import Card from '../card';

export default class PreviousChallenges extends Component {
  @service intl;

  displayBooleanState = (bool) => {
    const yes = this.intl.t('common.words.yes');
    const no = this.intl.t('common.words.no');
    return bool ? yes : no;
  };

  incrementIndex(index) {
    return index + 1;
  }

  <template>
    <section class="admin-form__content">
      <Card class="admin-form__card previous-challenges" @title="Précédentes épreuves">
        <div class="previous-challenges__container">
          {{#each @challenges as |challenge index|}}
            <div class="previous-challenges__result {{challenge.result}}">
              <p class="previous-challenges__result__count">Épreuve {{this.incrementIndex index}}</p>
              <h2>{{challenge.skill.name}}</h2>
              <p class="previous-challenges__result__focused">Focus :
                {{this.displayBooleanState challenge.focused}}
              </p>
              <p class="previous-challenges__result__timed">Temps imparti:
                {{this.displayBooleanState challenge.timer}}
              </p>
            </div>
          {{/each}}
        </div>
      </Card>
    </section>
  </template>
}
