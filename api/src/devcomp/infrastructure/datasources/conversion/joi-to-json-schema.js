import Joi from 'joi';

import { child, SCOPES } from '../../../../shared/infrastructure/utils/logger.js';

const logger = child('devcomp:joi-to-json-schema', { event: SCOPES.DEVCOMP });

export function convertJoiToJsonSchema(joiSchema) {
  if (!Joi.isSchema(joiSchema)) {
    throw new Error('Not a Joi schema');
  }

  return convertFromType(joiSchema.describe());
}

function convertFromType(joiDescribedSchema, key = '') {
  switch (joiDescribedSchema.type) {
    case 'boolean':
      return convertBoolean();
    case 'string':
      return convertString(joiDescribedSchema);
    case 'number':
      return convertNumber(joiDescribedSchema);
    case 'array':
      return convertArray(joiDescribedSchema, key);
    case 'object':
      return convertObject(joiDescribedSchema);
    case 'alternatives':
      return convertAlternatives(joiDescribedSchema);
    default:
      logger.warn({ type: joiDescribedSchema.type, schema: joiDescribedSchema }, 'Unsupported schema type');
  }
}

function convertBoolean() {
  return { type: 'boolean' };
}

function convertString(joiStringDescribedSchema) {
  const jsonSchema = { type: 'string', format: null, options: null };

  const rules = joiStringDescribedSchema.rules;

  if (hasFlag(joiStringDescribedSchema.flags, 'description')) {
    jsonSchema.options = { infoText: joiStringDescribedSchema.flags['description'] };
  }

  if (hasFlag(joiStringDescribedSchema.flags, 'default')) {
    jsonSchema.default = joiStringDescribedSchema.flags['default'];
  }

  const emailRule = findRule(rules, 'email');
  if (emailRule !== undefined) {
    jsonSchema.format = 'email';
  }

  const guidRule = findRule(rules, 'guid');
  if (guidRule !== undefined) {
    jsonSchema.format = 'uuid';
  }

  const isoDateRule = findRule(rules, 'isoDate');
  if (isoDateRule !== undefined) {
    jsonSchema.format = 'date';
  }

  const uriRule = findRule(rules, 'uri');
  if (uriRule !== undefined) {
    jsonSchema.format = 'uri';
  }

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minLength = minRule.args.limit;
  }

  const maxRule = findRule(rules, 'max');
  if (maxRule !== undefined) {
    jsonSchema.maxLength = maxRule.args.limit;
  }

  const patternRule = findRule(rules, 'pattern');
  if (patternRule) {
    if (!patternRule.args.options?.invert) {
      jsonSchema.pattern = convertRegex(patternRule.args.regex.toString());

      const customErrorMessage = getCustomErrorMessage(rules);
      if (customErrorMessage !== undefined) {
        jsonSchema.errorMessage = customErrorMessage;
      }
    }
  }

  if (joiStringDescribedSchema.allow?.length > 0) {
    const enumValues = joiStringDescribedSchema.allow.filter((allow) => allow.length > 0);
    if (enumValues.length > 0) {
      jsonSchema.enum = enumValues;
    }
  }

  const processedSchema = handleNonStandardStringProperties(joiStringDescribedSchema, jsonSchema);

  const allowsEmptyString = joiStringDescribedSchema.allow?.includes('');
  if (processedSchema.format === 'uri' && allowsEmptyString) {
    const schemaWithoutFormat = { ...processedSchema };
    Reflect.deleteProperty(schemaWithoutFormat, 'format');
    return {
      ...schemaWithoutFormat,
      anyOf: [{ format: 'uri' }, { maxLength: 0 }],
    };
  }

  return processedSchema;
}

function handleNonStandardStringProperties(joiStringDescribedSchema, jsonSchema) {
  if (joiStringDescribedSchema.externals?.length > 0) {
    if (joiStringDescribedSchema.externals[0].method.name === 'htmlValidation') {
      jsonSchema.format = 'jodit';
    }
  }

  return jsonSchema;
}

function convertNumber(joiNumberDescribedSchema) {
  const jsonSchema = { type: 'number', options: null };
  const rules = joiNumberDescribedSchema.rules;

  if (hasFlag(joiNumberDescribedSchema.flags, 'description')) {
    jsonSchema.options = { infoText: joiNumberDescribedSchema.flags['description'] };
  }

  const integerRule = findRule(rules, 'integer');
  if (integerRule !== undefined) {
    jsonSchema.type = 'integer';
  }

  const signRule = findRule(rules, 'sign');
  if (signRule !== undefined) {
    if (signRule.args.sign === 'positive') {
      jsonSchema.minimum = 1;
    } else {
      jsonSchema.maximum = -1;
    }
  }

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minimum = minRule.args.limit;
  }

  const maxRule = findRule(rules, 'max');
  if (maxRule !== undefined) {
    jsonSchema.maximum = maxRule.args.limit;
  }

  return jsonSchema;
}

function convertArray(joiArrayDescribedSchema, key = '') {
  const jsonSchema = { type: 'array', options: null };
  const rules = joiArrayDescribedSchema.rules;

  if (hasFlag(joiArrayDescribedSchema.flags, 'description')) {
    jsonSchema.options = { infoText: joiArrayDescribedSchema.flags['description'] };
  }

  const minRule = findRule(rules, 'min');
  if (minRule !== undefined) {
    jsonSchema.minItems = minRule.args.limit;
  }

  const uniqueRule = findRule(rules, 'unique');
  if (uniqueRule !== undefined) {
    jsonSchema.uniqueItems = true;
  }

  if (joiArrayDescribedSchema.items) {
    jsonSchema.items = {};

    const itemTitle = key.endsWith('s') ? key.slice(0, -1) : key;

    for (const item of joiArrayDescribedSchema.items) {
      jsonSchema.items = convertFromType(item);
      if (itemTitle) {
        jsonSchema.items.title = itemTitle;

        // Add headerTemplate for JSON Editor lib
        // See {@link https://github.com/json-editor/json-editor#dynamic-headers}
        // for further information
        jsonSchema.items.headerTemplate = `${itemTitle} {{i0}}`;
      }
    }
  }

  return jsonSchema;
}

function convertObject(joiObjectDescribedSchema) {
  const jsonSchema = { type: 'object' };

  if (joiObjectDescribedSchema.keys) {
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(joiObjectDescribedSchema.keys)) {
      properties[key] = convertFromType(value, key);

      if (hasFlag(value?.flags, 'presence', 'required')) {
        required.push(key);
      }
    }

    if (properties && Object.keys(properties).length > 0) {
      jsonSchema.properties = properties;
    }

    if (required && required.length > 0) {
      jsonSchema.required = required;
    }

    jsonSchema.additionalProperties = hasFlag(joiObjectDescribedSchema.flags, 'unknown', true);
  }

  return jsonSchema;
}

function generateIfThenOtherwiseSchema(match) {
  const baseSchema = convertFromType(match.otherwise);

  const conditionalKeyName = Object.keys(match.is.keys)[0];
  const schemaProperties = {
    [conditionalKeyName]: {
      const: match.is.keys[conditionalKeyName].allow[0].override,
    },
  };

  return {
    ...baseSchema,
    title: match.otherwise.keys.type.allow[0],
    if: { properties: schemaProperties },
    then: { properties: convertFromType(match.then).properties },
  };
}

function convertAlternatives(joiAlternativesDescribedSchema) {
  const match = joiAlternativesDescribedSchema.matches[0];

  if (Object.keys(match).includes('is')) {
    return generateIfThenOtherwiseSchema(match);
  }

  const oneOf = joiAlternativesDescribedSchema.matches.flatMap((match) => {
    if (match.ref !== undefined) {
      if (match.switch !== undefined) {
        return match.switch.map(getAlternativeSwitchCaseJsonSchema);
      } else {
        logger.warn({ match }, 'Unsupported conditional schema is/then/otherwise');
      }
    } else {
      return convertFromType(match.schema);
    }
  });

  return { oneOf };
}

function convertRegex(regex) {
  return regex.slice(1, -1).replace(/\\d/g, '[0-9]');
}

function getCustomErrorMessage(rules) {
  return rules?.find((rule) => rule.message?.template?.length > 0)?.message.template;
}

function getAlternativeSwitchCaseJsonSchema(switchCase) {
  const childJsonSchema = convertFromType(switchCase.then);

  const optionalTitle =
    getOptionalTitleBasedOnTitleMetadata(switchCase) ||
    getOptionalTitleBasedOnChildrenType(switchCase) ||
    getOptionalTitleBasedOnSiblingTagName(switchCase);
  if (optionalTitle !== undefined) {
    childJsonSchema.title = optionalTitle;
  }

  return childJsonSchema;
}

function getOptionalTitleBasedOnTitleMetadata(switchCase) {
  return switchCase.then?.metas?.find(({ title }) => title)?.title;
}

function getOptionalTitleBasedOnSiblingTagName(switchCase) {
  return switchCase.is?.allow[1];
}

function getOptionalTitleBasedOnChildrenType(switchCase) {
  return switchCase.then.keys?.type?.allow[0];
}

function findRule(rules, ruleName) {
  return rules?.find((rule) => rule.name === ruleName);
}

function hasFlag(flags, flagName, flagValue) {
  if (flags !== undefined) {
    return Object.entries(flags).some(([name, value]) => {
      if (!flagValue) {
        return flagName === name;
      }
      return flagName === name && flagValue === value;
    });
  }
  return false;
}
