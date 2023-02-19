import * as JSONEditor from '@json-editor/json-editor';
import { getSuperTagTraits } from '../utils/getTraits';
import { mergeSchema } from '../utils/mergeSchema';

export function initEditor(currentTiddlerTitle: string, editorElement: HTMLDivElement): JSONEditor.JSONEditor<unknown> | undefined {
  const superTags = getSuperTagTraits(currentTiddlerTitle);
  const tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? {};
  if (superTags.length === 0) return;
  const fullSchema = mergeSchema(superTags);
  return new JSONEditor.JSONEditor(editorElement, {
    schema: fullSchema,
    theme: 'spectre',
    iconlib: 'spectre',
    disable_edit_json: true,
    form_name_root: 'SuperTag',
    startval: tiddlerFields,
    no_additional_properties: true,
    use_default_values: true,
  });
}
