import type { IChangedTiddlers } from 'tiddlywiki';
import * as JSONEditor from '@json-editor/json-editor';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-icons.css';
import 'spectre.css/dist/spectre-exp.css';
import './style.css';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { getSuperTagTraits } from '../utils/getTraits';
import { mergeSchema } from '../utils/mergeSchema';

class SupertagFormWidget extends Widget {
  editor?: JSONEditor.JSONEditor<any>;
  containerElement?: HTMLDivElement;
  errorValidatorInfoElement?: HTMLSpanElement;
  currentTiddlerTitle?: string;

  refresh(_changedTiddlers: IChangedTiddlers): boolean {
    return false;
  }

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  render(parent: Element, _nextSibling: Element | null): void {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    const currentTiddlerTitle = this.getAttribute('tiddler') ?? this.getVariable('currentTiddler');
    this.currentTiddlerTitle = currentTiddlerTitle;

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
      const superTags = getSuperTagTraits(currentTiddlerTitle);
      const tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? {};
      if (superTags.length === 0) return;
      const fullSchema = mergeSchema(superTags);
      this.editor = new JSONEditor.JSONEditor(editorElement, {
        schema: fullSchema,
        theme: 'spectre',
        iconlib: 'spectre',
        disable_edit_json: true,
        form_name_root: 'SuperTag',
        startval: tiddlerFields,
        no_additional_properties: true,
        use_default_values: true,
      });
      this.editor.on('change', this.formOnChange);
    }
  }

  private readonly formOnChange = () => {
    if (this.editor === undefined) return;
    const latestFormValue = this.editor?.getValue() as Record<string, unknown>;
    if (this.currentTiddlerTitle !== undefined && latestFormValue !== undefined && latestFormValue !== null && this.errorValidatorInfoElement !== undefined) {
      // Get an array of errors from the validator
      const errors = this.editor.validate();
      if (errors.length > 0) {
        this.errorValidatorInfoElement.className = 'label label-warning';
        this.errorValidatorInfoElement.textContent = 'Form not valid';
      } else {
        const tiddlerFields = $tw.wiki.getTiddler(this.currentTiddlerTitle)?.fields ?? {};
        $tw.wiki.addTiddler({ ...tiddlerFields, ...latestFormValue, title: this.currentTiddlerTitle });
      }
    }
  };

  removeChildDomNodes(): void {
    this.editor?.off('change', this.formOnChange);
    this.editor?.destroy();
    this.editor = undefined;
    this.containerElement = undefined;
    this.errorValidatorInfoElement = undefined;
  }
}

declare const exports: Record<string, typeof Widget>;
exports['supertag-form'] = SupertagFormWidget;
