// Import the default blocks. (It is mandatory)
import 'blockly/blocks';

import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import CopyButton from 'ember-cli-clipboard/components/copy-button';
import isClipboardSupported from 'ember-cli-clipboard/helpers/is-clipboard-supported';
import { modifier } from 'ember-modifier';

Blockly.setLocale(En);

Blockly.defineBlocksWithJsonArray([
  {
    type: 'quest',
    tooltip: '',
    helpUrl: '',
    message0: 'rewardType %1 rewardId %2 eligilityRequirements %3 successRequirements %4',
    args0: [
      {
        type: 'input_value',
        name: 'REWARD_TYPE',
        check: 'String',
      },
      {
        type: 'input_value',
        name: 'REWARD_ID',
        check: 'Number',
      },
      {
        type: 'input_statement',
        name: 'ELIGIBILITY_REQUIREMENTS',
        check: 'requirement',
      },
      {
        type: 'input_statement',
        name: 'SUCCESS_REQUIREMENTS',
        check: 'requirement',
      },
    ],
    colour: 75,
    inputsInline: false,
  },
  {
    type: 'requirement',
    tooltip: '',
    helpUrl: '',
    message0: 'requirement_type %1 %2 comparison %3 %4 data %5',
    args0: [
      {
        type: 'field_dropdown',
        name: 'REQUIREMENT_TYPE',
        options: [
          ['compose', 'compose'],
          ['organization', 'organization'],
          ['campaignParticipations', 'campaignParticipations'],
          ['skill', 'skill'],
        ],
      },
      {
        type: 'input_dummy',
        name: '1',
      },
      {
        type: 'field_dropdown',
        name: 'COMPARISON',
        options: [
          ['one of', 'one-of'],
          ['all', 'all'],
          ['equal', 'equal'],
        ],
      },
      {
        type: 'input_dummy',
        name: '2',
      },
      {
        type: 'input_statement',
        name: 'DATA',
        check: 'criterion_property',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 225,
    inputsInline: false,
  },
  {
    type: 'criterion_property',
    tooltip: '',
    helpUrl: '',
    message0: '%1 %2 %3 %4 %5 %6 data %7',
    args0: [
      {
        type: 'field_label_serializable',
        text: 'comparison',
        name: '',
      },
      {
        type: 'field_dropdown',
        name: 'COMPARISON',
        options: [
          ['one of', 'one-of'],
          ['all', 'all'],
          ['equal', 'equal'],
        ],
      },
      {
        type: 'input_dummy',
        name: '1',
      },
      {
        type: 'field_label_serializable',
        text: 'key',
        name: '',
      },
      {
        type: 'field_input',
        name: 'KEY',
        text: 'default',
      },
      {
        type: 'input_dummy',
        name: '2',
      },
      {
        type: 'input_value',
        name: 'VALUE',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 345,
  },
]);

const blocklyModifier = modifier((element, [setWorkspace]) => {
  const toolbox = {
    kind: 'flyoutToolbox',
    contents: [
      { kind: 'block', type: 'quest' },
      { kind: 'block', type: 'criterion_property' },
      { kind: 'block', type: 'requirement' },
      { type: 'lists_create_with', kind: 'block' },
      { type: 'logic_null', kind: 'block' },
      { type: 'text', kind: 'block' },
      { type: 'math_number', kind: 'block' },
      {
        type: 'logic_boolean',
        kind: 'block',
        fields: {
          BOOL: 'TRUE',
        },
      },
    ],
  };

  const workspace = Blockly.inject(element, {
    toolbox,
    move: {
      scrollbars: {
        horizontal: true,
        vertical: true,
      },
      drag: true,
      wheel: false,
    },
  });
  setWorkspace(workspace);
});

const Order = {
  ATOMIC: 0,
};

function checkBlockValidity(block, output) {
  try {
    JSON.parse(output);
    block.setWarningText('');
  } catch {
    block.setWarningText('Ce block est soit incomplet soit invalide');
  }
}

export const jsonGenerator = new Blockly.Generator('JSON');

jsonGenerator.scrub_ = function (block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + ',' + jsonGenerator.blockToCode(nextBlock);
  }
  return code;
};

jsonGenerator.forBlock['requirement'] = function (block, generator) {
  const requirement_type = block.getFieldValue('REQUIREMENT_TYPE');
  const comparison = block.getFieldValue('COMPARISON');
  const statement_members = generator.statementToCode(block, 'DATA');
  let data;
  if (requirement_type === 'compose') {
    data = `[${statement_members}]`;
  } else {
    data = `{${statement_members}}`;
  }
  const output = `{
"requirement_type": "${requirement_type}",
"comparison": "${comparison}",
"data":
${data}
}`;
  checkBlockValidity(block, output);
  return output;
};

jsonGenerator.forBlock['quest'] = function (block, generator) {
  const reward_type = generator.valueToCode(block, 'REWARD_TYPE', Order.ATOMIC);
  const reward_id = generator.valueToCode(block, 'REWARD_ID', Order.ATOMIC);
  const eligibility_members = generator.statementToCode(block, 'ELIGIBILITY_REQUIREMENTS');
  const success_members = generator.statementToCode(block, 'SUCCESS_REQUIREMENTS');
  const output = `{
"rewardType": ${reward_type},
"rewardId": ${reward_id},
"eligibilityRequirements": [
${eligibility_members}
],
"successRequirements": [
${success_members}
]
}`;
  checkBlockValidity(block, output);
  return output;
};

jsonGenerator.forBlock['criterion_property'] = function (block, generator) {
  const key = block.getFieldValue('KEY');
  const comparison = block.getFieldValue('COMPARISON');
  const value = generator.valueToCode(block, 'VALUE', Order.ATOMIC);
  return `"${key}": { "comparison": "${comparison}", "data": ${value} }`;
};

jsonGenerator.forBlock['logic_boolean'] = function (block) {
  const code = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['math_number'] = function (block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['logic_null'] = function () {
  return ['null', Order.ATOMIC];
};

jsonGenerator.forBlock['text'] = function (block) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['lists_create_with'] = function (block, generator) {
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = generator.valueToCode(block, 'ADD' + i, Order.ATOMIC);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',');
  const indentedValueString = generator.prefixLines(valueString, generator.INDENT);
  const codeString = '[' + indentedValueString + ']';
  return [codeString, Order.ATOMIC];
};

import Component from '@glimmer/component';

export default class extends Component {
  @tracked workspace = null;
  @tracked code = '';
  @tracked isValid = true;

  @action
  setWorkspace(value) {
    this.workspace = value;
    this.workspace.addChangeListener(() => {
      try {
        const generated = jsonGenerator.workspaceToCode(this.workspace);
        this.code = JSON.stringify(JSON.parse(generated), undefined, 2);
        this.isValid = true;
      } catch (err) {
        console.error(err);
        this.isValid = false;
      }
    });
  }

  <template>
    <div class="quest-editor">
      <div class="quest-editor__workspace" {{blocklyModifier this.setWorkspace}}></div>
      <div class="quest-editor__output">
        <div class="quest-editor__actions">
          {{#if this.isValid}}
            {{#if (isClipboardSupported)}}
              <CopyButton
                @text={{this.code}}
                aria-label="Copier le JSON de la quête"
                class="pix-icon-button pix-icon-button--small pix-icon-button--dark-grey"
              >
                <PixIcon @name="copy" @ariaHidden={{true}} />
              </CopyButton>
            {{/if}}
          {{else}}
            <PixNotificationAlert @type="error" @withIcon={{true}}>La configuration de blocs n'est pas valide ou
              incomplète.</PixNotificationAlert>
          {{/if}}
        </div>
        <pre>{{this.code}}</pre>
      </div>
    </div>
  </template>
}
