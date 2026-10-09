import { PixIcon } from '@1024pix/nebulix-ember';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import convertToHtml from 'mon-pix/helpers/convert-to-html';
import stripInstruction from 'mon-pix/helpers/strip-instruction';
import resultIcon from 'mon-pix/utils/result-icon';

export default class ResultItemComponent extends Component {
  <template>
    <div class="result-item">
      {{#if this.resultItem}}
        <div class="result-item__icon" title="{{this.resultTooltip}}">
          <PixIcon
            @name={{this.resultItem.icon}}
            @plainIcon={{true}}
            @ariaHidden={{true}}
            class={{concat "result-item__icon--" this.resultItem.color}}
          />
        </div>

        <div class="result-item__instruction">
          {{stripInstruction (convertToHtml @answer.challenge.instruction) this.textLength}}
        </div>

        <div class="result-item__correction">
          <span class="sr-only">{{this.resultTooltip}}</span>
          {{#if this.validationImplementedForChallengeType}}
            <button
              {{on "click" (fn @openAnswerDetails @answer)}}
              id="button-comparision-answer-{{@answer.id}}"
              class="result-item__correction-button link js-correct-answer"
              type="button"
            >
              {{t "pages.result-item.actions.see-answers-and-tutorials.label"}}
            </button>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
  @service intl;

  get resultItem() {
    return resultIcon(this.args.answer.result);
  }

  get resultTooltip() {
    return this.resultItem ? this.intl.t(`pages.comparison-window.results.${this.args.answer.result}.tooltip`) : null;
  }

  get validationImplementedForChallengeType() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.args.answer.get('challenge.type');
    return implementedTypes.includes(challengeType);
  }

  get textLength() {
    return window.innerWidth <= 767 ? 60 : 110;
  }
}
