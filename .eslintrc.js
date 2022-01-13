module.exports = {
  extends: [
    'airbnb-base',
  ],
  rules: {
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__v'],
      },
    ],
    'object-shorthand': [2, 'consistent'],
    'arrow-parens': ['error', 'as-needed'],
    'linebreak-style': ['error', 'windows'],
    'no-param-reassign': ['error', { props: false }],
    'quote-props': ['error', 'consistent'],
  },
  env: {
    'es2020': true,
  },
};
