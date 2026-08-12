import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';
import { trackedArray } from '@ember/reactive/collections';
import { tracked } from '@glimmer/tracking';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { service } from '@ember/service';


export default class ScoringForm extends Component {
  @service pixToast
  @tracked globalScoringConfiguration = this.args.draftVersion.globalScoringConfiguration
  @tracked hasError = false;

  @action
  saveCapacityByMesh (event) {
    event.preventDefault();

    try {
      this.args.draftVersion.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.scoring.success-notification',
        ),
      });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: err.errors?.[0].detail });
    }
  }

  @action
  updateValue (name , index, event) {
    const isMax = name === 'max'
    const newArray = this.globalScoringConfiguration;
    newArray.at(index)[name] = Number(event.target.value);

    if (isMax && this.globalScoringConfiguration.at(index + 1) ) {
      newArray.at(index + 1).min = Number(event.target.value);
    }
    this.globalScoringConfiguration = [...newArray];
    this.fieldValidator();
  }

  fieldValidator () {
    const errors = this.globalScoringConfiguration.map(({min, max}) => {
      if (max <= min) return 'error';
      return 'default'
    })
    this.hasError = errors.some((error) => error === 'error');
  }

  @action
  isNotFirstRow (index) {
    return index !== 0;
  }

  @action
  isFirstRow (index) {
    return index === 0;
  }

  @action
  lastMaxValue (index) {
    return this.globalScoringConfiguration.at(index-1)?.max
  }

  @action
  isGreaterThanMin (index) {
    return this.globalScoringConfiguration.at(index).max > this.globalScoringConfiguration.at(index).min
  }

  <template>
    <Card
      class="versions-scoring"
      @title={{t "components.certification-frameworks.certification-framework.versions.scoring.title"}}
    >
      <form id="version-scoring-form" class="versions-scoring__form" {{on "submit" this.saveCapacityByMesh}}>
        {{#each this.globalScoringConfiguration as |mesh|}}
        <h3>{{t "components.certification-frameworks.certification-framework.versions.scoring.level" index=mesh.index}}</h3>
          <section>
            <PixInput
              type="number"
              readonly={{this.isNotFirstRow mesh.index}}
              required={{this.isFirstRow mesh.index}}
              @requiredLabel={{if (this.isFirstRow mesh.index) (t "common.forms.mandatory") false}}
              @value={{if (this.isNotFirstRow mesh.index) (this.lastMaxValue mesh.index) mesh.min}}
              {{on "change"  (fn this.updateValue "min" mesh.index)}}
            >
              <:label>{{t "components.certification-frameworks.certification-framework.versions.scoring.minimum-input-label"}}</:label>
            </PixInput>

            <PixInput
              type="number"
              required={{this.isFirstRow mesh.index}}
              @requiredLabel={{if (this.isFirstRow mesh.index) (t "common.forms.mandatory") false}}
              @errorMessage={{t
                "components.certification-frameworks.certification-framework.versions.scoring.cannot-be-lower-error"
              }}
              @validationStatus={{if (this.isGreaterThanMin mesh.index) 'default' 'error'}}
              @value={{mesh.max}}
              {{on "change" (fn this.updateValue "max" mesh.index)}}
            >
              <:label>{{t "components.certification-frameworks.certification-framework.versions.scoring.maximum-input-label"}}</:label>
            </PixInput>
          </section>
        {{/each}}

       <PixButton @type="submit" form="version-scoring-form" @isDisabled={{this.hasError}} @variant="primary-bis">
          {{t "components.certification-frameworks.certification-framework.versions.scoring.capacity-submit-button"}}
        </PixButton>
      </form>

    </Card>
    <section class="actions-container">
      <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
        {{t "common.actions.cancel"}}
      </PixButtonLink>

    </section>
  </template>
}
