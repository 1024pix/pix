import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import Card from '../card';

export default class CurrentChallenge extends Component {
  @service intl;

  displayBooleanState = (bool) => {
    const yes = this.intl.t('common.words.yes');
    const no = this.intl.t('common.words.no');
    return bool ? yes : no;
  };

  <template>
    <Card class="admin-form__card current-challenge" @title="Épreuve en cours: {{this.currentChallenge.skill.name}}">
      <ul>
        <li>Nom de l'acquis testé : <span class="current-challenge__name">{{@challenge.skill.name}}</span></li>

        <li>Épreuve avec temps imparti ?
          <PixTag @color="{{if @challenge.timer 'tertiary' 'neutral'}}">
            {{this.displayBooleanState @challenge.timer}}
          </PixTag>
        </li>

        <li class="current-challenge__details">Épreuve focus ?
          <PixTag @color="{{if @challenge.focused 'tertiary' 'neutral'}}">
            {{this.displayBooleanState @challenge.focused}}
          </PixTag>
        </li>

        <li class="current-challenge__details">Type de challenge :
          {{@challenge.type}}
        </li>

        {{#if @challenge.instruction}}
          <li class="current-challenge__instruction">
            {{@challenge.instruction}}
          </li>
        {{/if}}

      </ul>

      <div class="current-challenge__actions">

        <PixButton @variant="error" @triggerAction={{@failCurrentChallenge}}>
          Rater l'épreuve
        </PixButton>

        <PixButton @variant="success" @triggerAction={{@succeedCurrentChallenge}}>
          Réussir l'épreuve
        </PixButton>

        <PixButton @variant="secondary" @triggerAction={{@reset}}>
          Redémarrer la simulation
        </PixButton>

      </div>
    </Card>
  </template>
}
