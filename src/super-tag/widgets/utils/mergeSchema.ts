import type { JSONSchema4 } from 'json-schema';
import type { ISuperTagData } from './getTraits';

/**
 * Merge schema by merging traits' properties together.
 * Assuming tiddler is a flat JSON `Record<string, string | number>` with only 1 level.
 */
export function mergeSchema(superTags: ISuperTagData[]): JSONSchema4 {
  const fullSchema: JSONSchema4 = superTags.reduce(
    (accumulator: JSONSchema4, trait) => {
      trait.traits.forEach(({ schema }) => {
        accumulator.properties = { ...accumulator.properties, ...schema.properties };
      });
      return accumulator;
    },
    {
      type: 'object',
      properties: {},
    },
  );
  return fullSchema;
}
