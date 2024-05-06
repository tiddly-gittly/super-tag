import type { Widget, ITiddlerFields } from 'tiddlywiki';
import { type ISuperTagData, getSuperTagTraits } from './getTraits';
import { mergeSchema } from './mergeSchema';
import type { JSONSchema4 } from 'json-schema';
import { translateSchema } from './translateSchema';

export function getFullSchemaFromCurrentTiddler(currentTiddlerTitle: string) {
  const superTags = getSuperTagTraits(currentTiddlerTitle);
  const tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? ({} as ITiddlerFields);
  if (superTags.length === 0) return;
  const fullSchema = mergeSchema(superTags);
  return { fullSchema, tiddlerFields };
}

/**
 * Used by `json-editor-form` widget.
 * For `supertag-form` widget, see `getFullSchemaFromCurrentTiddler`.
 */
export function getFullSchemaFromFilter(filter: string, currentTiddlerTitle: string, parentWidget: Widget) {
  const jsonSchemas = $tw.wiki
    .filterTiddlers(filter, parentWidget)
    .map((schema) => {
      try {
        return JSON.parse(schema) as JSONSchema4;
      } catch {
        return undefined;
      }
    })
    .filter((item): item is JSONSchema4 => item !== undefined);
  const superTags = jsonSchemas.map(translateSchema).map((schema) => ({ title: '<generated from filter>', traits: [{ schema }] } as ISuperTagData));
  const fullSchema = mergeSchema(superTags);
  const tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? ({} as ITiddlerFields);
  return { fullSchema, tiddlerFields };
}
