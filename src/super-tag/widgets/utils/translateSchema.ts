import type { JSONSchema4 } from 'json-schema';

const ignoredMetadataKeys = ['type', 'format', 'enum', 'propertyOrder'];
/**
 * Translate trait tag's schema that has `lingo-base` property on top level.
 * @param traitTagSchema Schema from a trait tag's schema field
 * @example `{    "type": "object",    "lingo-base": "$:/plugins/linonetwo/intention-tower-knowledge-graph/language/",    "properties": {        "calendar_tag": {            "type": "string",            "title": "TraitTag/DefaultTagWhenAdd/Caption",            "description": "TraitTag/DefaultTagWhenAdd/Description"        }    }}`
 */
export function translateSchema(traitTagSchema: JSONSchema4): JSONSchema4 {
  const lingoBase = traitTagSchema['lingo-base'];
  if (!lingoBase || typeof lingoBase !== 'string') return traitTagSchema;
  const languageCode = $tw.wiki.filterTiddlers('[[$:/language]get[text]get[name]else[en-GB]]')[0]
  const translatedProperties = Object.entries(traitTagSchema.properties ?? {}).reduce((acc, [key, fieldDefinition]) => {
    // translate fields like `title` `description` in `fieldDefinition`. But ignore fields like `type` `format` `enum` `propertyOrder`.
    if (typeof fieldDefinition !== 'object' || !fieldDefinition) return acc;
    const translatedFieldDefinition = Object.entries(fieldDefinition).reduce((acc, [fieldKey, fieldValue]) => {
      if (ignoredMetadataKeys.includes(fieldKey) || typeof fieldValue !== 'string') return { ...acc, [fieldKey]: fieldValue };
      const translatedFieldValue = $tw.wiki.getTiddlerText(`${lingoBase}${languageCode}/${fieldValue}`, fieldValue);
      return { ...acc, [fieldKey]: translatedFieldValue };
    }, {} as Record<string, string>);
    acc[key] = translatedFieldDefinition;
    return acc;
  }, {} as Record<string, JSONSchema4>);
  return {
    ...traitTagSchema,
    properties: translatedProperties,
  };
}
