export default {
  ARIA_LABEL: '§',
  BLOCK: new RegExp(/(\${[^}]+})/),
  ESCAPE_SELECT: '\\/\\/',
  PLACEHOLDER_AND_ARIA_LABEL: new RegExp(/[#§]/),
  PLACEHOLDER: '#',
  RESPONSE_BLOCK_BEGIN: '${',
  RESPONSE_BLOCK_END: '}',
  SELECT: 'options=',
  DEFAULT_VALUE: 'value=',
};
