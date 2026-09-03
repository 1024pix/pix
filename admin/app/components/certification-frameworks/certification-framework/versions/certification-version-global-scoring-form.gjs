import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class GlobalScoringForm extends Component {
  @service pixToast;
  @service intl;

  get globalScoringConfiguration() {
    const savedConfiguration = this.args.editVersion.globalScoringConfiguration;
    return savedConfiguration?.length
      ? savedConfiguration
      : (this.args.calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
  }

  get previousVersionConfiguration() {
    return this.args.previousVersion?.globalScoringConfiguration ?? [];
  }

  @action
  updateValue(name, index, event) {
    const isMax = name === 'max';
    const newArray = [...this.globalScoringConfiguration];
    const value = event.target.value === '' ? null : Number(event.target.value);
    newArray.at(index).bounds[name] = value;

    if (isMax && newArray.at(index + 1)) {
      newArray.at(index + 1).bounds.min = value;
    }
    this.args.editVersion.globalScoringConfiguration = newArray;
  }

  @action
  isNotFirstRow(index) {
    return index !== 0;
  }

  @action
  lastMaxValue(index) {
    return this.#boundsAt(index - 1)?.max;
  }

  #boundsAt(index) {
    return this.globalScoringConfiguration.at(index).bounds;
  }

  @action
  isGreaterThanMin(index) {
    const { max, min } = this.#boundsAt(index);
    return max == null || min == null || max > min;
  }

  @action
  minValidationStatus(index) {
    return this.#boundsAt(index).min == null ? 'error' : 'default';
  }

  @action
  maxValidationStatus(index) {
    const { max } = this.#boundsAt(index);
    return max == null || !this.isGreaterThanMin(index) ? 'error' : 'default';
  }

  @action
  previousVersionBound(meshLevel, name) {
    const bounds = this.previousVersionConfiguration.find((mesh) => mesh.meshLevel === meshLevel)?.bounds;
    return bounds ? bounds[name] : '—';
  }

  <template>
    <Card
      class="versions-scoring"
      @title={{t "components.certification-frameworks.certification-framework.versions.scoring.title"}}
    >
      <form id="version-scoring-form" class="versions-scoring__form">
        {{#each this.globalScoringConfiguration as |mesh|}}
          <h3>

            {{t
              "components.certification-frameworks.certification-framework.versions.scoring.level"
              index=mesh.meshLevel
            }}</h3>
          <section>
            <PixInput
              type="number"
              step="0.0000000001"
              readonly={{this.isNotFirstRow mesh.meshLevel}}
              required="true"
              @requiredLabel={{t "common.forms.mandatory"}}
              @errorMessage={{t
                "components.certification-frameworks.certification-framework.versions.scoring.required-error"
              }}
              @validationStatus={{this.minValidationStatus mesh.meshLevel}}
              @value={{if (this.isNotFirstRow mesh.meshLevel) (this.lastMaxValue mesh.meshLevel) mesh.bounds.min}}
              {{on "change" (fn this.updateValue "min" mesh.meshLevel)}}
            >
              <:label>{{t
                  "components.certification-frameworks.certification-framework.versions.scoring.previous-version-capacity"
                  previousVersionCapacity=(this.previousVersionBound mesh.meshLevel "min")
                }}</:label>
            </PixInput>

            <PixInput
              type="number"
              step="0.0000000001"
              required="true"
              @requiredLabel={{t "common.forms.mandatory"}}
              @errorMessage={{t
                "components.certification-frameworks.certification-framework.versions.scoring.cannot-be-lower-error"
              }}
              @validationStatus={{this.maxValidationStatus mesh.meshLevel}}
              @value={{mesh.bounds.max}}
              {{on "change" (fn this.updateValue "max" mesh.meshLevel)}}
            >
              <:label>{{t
                  "components.certification-frameworks.certification-framework.versions.scoring.previous-version-capacity"
                  previousVersionCapacity=(this.previousVersionBound mesh.meshLevel "max")
                }}</:label>
            </PixInput>
          </section>
        {{/each}}
      </form>
    </Card>
  </template>
}
