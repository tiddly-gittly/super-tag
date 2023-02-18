import type { ITiddlerFields } from 'tiddlywiki';

export interface ITraitTagData {
  schema: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
}
export interface ISuperTagData {
  title: string;
  traits: ITraitTagData[];
}
export function getTraits(currentTiddlerTitle: string): ISuperTagData[] {
  const potentialSuperTags = $tw.wiki
    .getTiddler(currentTiddlerTitle)
    ?.fields?.tags?.map((tagTitle) => $tw.wiki.getTiddler(tagTitle)?.fields)
    ?.filter((superTagTiddler): superTagTiddler is ITiddlerFields => superTagTiddler !== undefined);
  if (potentialSuperTags === undefined) return [];
  return potentialSuperTags
    .map((superTagTiddler) => {
      const { title, tags } = superTagTiddler;
      const traits = tags
        .map((traitTitle) => {
          const potentialTraitTiddler = $tw.wiki.getTiddler(traitTitle);
          if (potentialTraitTiddler?.fields?.tags?.some((tag) => tag === '$:/SuperTag/TraitTag') !== true) return undefined;
          // now it is confirmed to be a trait tag
          let { title, schema, uiSchema } = potentialTraitTiddler.fields;
          if (typeof schema !== 'string') return undefined;
          try {
            schema = JSON.parse(schema);
          } catch (error) {
            console.error(`TraitTag ${title} has invalid schema, error: ${(error as Error).message}`);
            return undefined;
          }
          if (typeof uiSchema !== 'string') return undefined;
          try {
            uiSchema = JSON.parse(uiSchema);
          } catch (error) {
            console.error(`TraitTag ${title} has invalid uiSchema, error: ${(error as Error).message}`);
            return undefined;
          }
          return {
            schema,
            uiSchema,
          } as ITraitTagData;
        })
        .filter((item): item is ITraitTagData => item !== undefined);
      if (traits.length === 0) return undefined;

      return {
        title,
        traits,
      };
    })
    .filter((item): item is ISuperTagData => item !== undefined);
}
