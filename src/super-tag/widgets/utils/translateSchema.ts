import type { JSONSchema4 } from 'json-schema';

const ignoredMetadataKeys = ['type', 'format', 'enum', 'propertyOrder', 'lingo-base'];
/**
 * Translate trait tag's schema that has `lingo-base` property on top level.
 * @param traitTagSchema Schema from a trait tag's schema field
 * @example `{    "type": "object",    "lingo-base": "$:/plugins/linonetwo/intention-tower-knowledge-graph/language/",    "properties": {        "calendar_tag": {            "type": "string",            "title": "TraitTag/DefaultTagWhenAdd/Caption",            "description": "TraitTag/DefaultTagWhenAdd/Description",   "options": {         "enum_titles": [           "TraitTag/DefaultTagWhenAdd/Enum/1",           "TraitTag/DefaultTagWhenAdd/Enum/2"         ]       }  }    }}`
 */
export function translateSchema(traitTagSchema: JSONSchema4): JSONSchema4 {
  const lingoBase = traitTagSchema['lingo-base'];
  if (!lingoBase || typeof lingoBase !== 'string') return traitTagSchema;
  const languageCode = $tw.wiki.filterTiddlers('[[$:/language]get[text]get[name]else[en-GB]]')[0]
  const translatedProperties = Object.entries(traitTagSchema.properties ?? {}).reduce((acc, [propertyKey, propertyDefinition]) => {
    // translate fields like `title` `description` in `fieldDefinition`. But ignore fields like `type` `format` `enum` `propertyOrder`.
    if (typeof propertyDefinition !== 'object' || !propertyDefinition) return acc;
    const translatedFieldDefinition = Object.entries(propertyDefinition).reduce((acc, [propertyDefinitionField, propertyDefinitionValue]) => {
      if (propertyDefinitionField === 'options' && typeof propertyDefinitionValue === 'object' && propertyDefinitionValue) {
        // translate enum_titles
        const translatedEnumTitles = (propertyDefinitionValue as Record<string, string[]>).enum_titles?.map((enumTitle) => $tw.wiki.getTiddlerText(`${lingoBase}${languageCode}/${enumTitle}`, enumTitle));
        return { ...acc, options: { ...propertyDefinitionValue, enum_titles: translatedEnumTitles } };
      }
      if (ignoredMetadataKeys.includes(propertyDefinitionField) || typeof propertyDefinitionValue !== 'string') return { ...acc, [propertyDefinitionField]: propertyDefinitionValue };
      // translate other fields
      const translatedFieldValue = $tw.wiki.getTiddlerText(`${lingoBase}${languageCode}/${propertyDefinitionValue}`, propertyDefinitionValue);
      return { ...acc, [propertyDefinitionField]: translatedFieldValue };
    }, {} as Record<string, string>);
    acc[propertyKey] = translatedFieldDefinition;
    return acc;
  }, {} as Record<string, JSONSchema4>);
  return {
    ...traitTagSchema,
    properties: translatedProperties,
  };
}
