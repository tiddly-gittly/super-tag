import type { widget as Widget } from '$:/core/modules/widgets/widget.js';
import type * as JSONEditor from '@json-editor/json-editor';

import components from '$:/plugins/linonetwo/super-tag/widgets/supertag-form/index.js';
import { initEditor } from '$:/plugins/linonetwo/super-tag/utils/initEditor.js';
import { formOnChange } from '../utils/formOnChange';
import { getFullSchemaFromFilter } from '../utils/getFullSchema';

const { 'supertag-form': SupertagFormWidget } = components as Record<string, typeof Widget>;

class JSONEditorFormWidget extends SupertagFormWidget {
  editor?: JSONEditor.JSONEditor<unknown>;
  containerElement?: HTMLDivElement;
  errorValidatorInfoElement?: HTMLSpanElement;
  filterToGetJSONSchema?: string;
  currentTiddlerTitle?: string;

  render(parent: Element, _nextSibling: Element | null): void {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    const filterToGetJSONSchema = this.getAttribute('filter') ?? '[all[current]tags[]tags[]] :filter[tags[]match[$:/SuperTag/TraitTag]] :and[get[schema]]';
    const currentTiddlerTitle = this.getAttribute('tiddler') ?? this.getVariable('currentTiddler');
    this.currentTiddlerTitle = currentTiddlerTitle;
    this.filterToGetJSONSchema = filterToGetJSONSchema;

    if (this.editor === undefined) {
      const containerElement = document.createElement('div');
      const editorElement = document.createElement('div');
      const errorValidatorInfoElement = document.createElement('span');
      this.errorValidatorInfoElement = errorValidatorInfoElement;
      this.containerElement = containerElement;
      containerElement.appendChild(editorElement);
      containerElement.appendChild(errorValidatorInfoElement);
      this.domNodes.push(containerElement);
      // eslint-disable-next-line unicorn/prefer-dom-node-append
      parent.appendChild(containerElement);
      if (this.parentWidget === undefined) return;
      const { fullSchema, tiddlerFields } = getFullSchemaFromFilter(filterToGetJSONSchema, currentTiddlerTitle, this.parentWidget);
      if (fullSchema === undefined) return;
      if (tiddlerFields === undefined) return;
      this.editor = initEditor(fullSchema, tiddlerFields, editorElement);
      this.editor?.on('change', this.formOnChange);
    }
  }

  private readonly formOnChange = () => {
    formOnChange(this.currentTiddlerTitle, this.editor, this.errorValidatorInfoElement);
  };
}

declare const exports: Record<string, typeof Widget>;
exports['json-editor-form'] = JSONEditorFormWidget;
