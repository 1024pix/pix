import { PixBlock, PixButton, PixIcon, PixTag } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import convertToHtml from 'mon-pix/helpers/convert-to-html';
import stripInstruction from 'mon-pix/helpers/strip-instruction';

export default class ResultItemComponent extends Component {
  @service intl;

  get resultTooltip() {
    return this.result ? this.intl.t(`pages.comparison-window.results.${this.args.answer.result}.tooltip`) : null;
  }

  get validationImplementedForChallengeType() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.args.answer.get('challenge.type');
    return implementedTypes.includes(challengeType);
  }

  get textLength() {
    return 110;
  }

  resultIcons = {
    ok: {
      icon: 'checkCircle',
      color: 'success-light',
    },
    ko: {
      icon: 'cancel',
      color: 'error-light',
    },
    focusedOut: {
      icon: 'cancel',
      color: 'error-light',
    },
    aband: {
      icon: 'help',
      color: 'neutral-light',
    },
    timedout: {
      icon: 'cancel',
      color: 'error-light',
    },
  };

  get result() {
    return this.resultIcons[this.args.answer.result];
  }

  get answerNumber() {
    return this.args.answerIndex + 1;
  }

  <template>
    <PixBlock class="result-item" @condensed={{true}} @variant="primary">
      {{#if this.result}}
        <h3 class="result-item__title pix-body-s">
          {{t "components.assessments.result-item.question-number" number=this.answerNumber}}
          <PixTag
            @variant={{this.result.color}}
            @iconBefore={{this.result.icon}}
            @type="squircle"
            @size="small"
            @plainIcon={{true}}
            @textTransform="uppercase"
          >
            {{this.resultTooltip}}
          </PixTag>
        </h3>

        <div class="result-item__content">
          <div class="pix-body-s">
            {{stripInstruction (convertToHtml @answer.challenge.instruction) this.textLength}}
          </div>

          {{#if this.validationImplementedForChallengeType}}
            <PixButton @variant="tertiary" @triggerAction={{fn @openAnswerDetails @answer}}>
              {{t "components.assessments.result-item.actions.see-answers-and-tutorials.label"}}
            </PixButton>
          {{/if}}
        </div>
      {{/if}}
    </PixBlock>
  </template>
}
