import * as JSONEditor from '@json-editor/json-editor';
import type { ITiddlerFields } from 'tiddlywiki';
import type { JSONSchema4 } from 'json-schema';
import type { initEditor as IInitEditor } from '$:/plugins/linonetwo/super-tag/utils/initEditor.js';

function initEditor(fullSchema: JSONSchema4, tiddlerFields: ITiddlerFields, editorElement: HTMLDivElement): JSONEditor.JSONEditor<unknown> | undefined {
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

declare const exports: Record<string, typeof IInitEditor>;
exports.initEditor = initEditor;
