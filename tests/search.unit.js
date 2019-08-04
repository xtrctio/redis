'use strict';

const { expect } = require('chai');

const Redis = require('../index');

describe('search unit tests', () => {
  it('process schema with one field', () => {
    const schema = {
      field1: {
        type: 'text',
        sortable: true,
      },
    };

    const schemaArray = Redis._processSchema(schema);

    expect(schemaArray).to.eql(['SCHEMA', 'field1', 'TEXT', 'SORTABLE']);
  });

  it('process schema with multiple fields', () => {
    const schema = {
      field1: {
        type: 'text',
        sortable: true,
      },
      field2: {
        type: 'geo',
        noStem: true,
      },
    };

    const schemaArray = Redis._processSchema(schema);

    expect(schemaArray).to.eql(['SCHEMA', 'field1', 'TEXT', 'SORTABLE', 'field2', 'GEO', 'NOSTEM']);
  });
});
