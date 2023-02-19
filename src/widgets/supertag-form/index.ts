import type { IChangedTiddlers } from 'tiddlywiki';
import type * as JSONEditor from '@json-editor/json-editor';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-icons.css';
import 'spectre.css/dist/spectre-exp.css';
import './style.css';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { initEditor } from './initEditor';

class SupertagFormWidget extends Widget {
  editor?: JSONEditor.JSONEditor<unknown>;
  containerElement?: HTMLDivElement;
  errorValidatorInfoElement?: HTMLSpanElement;
  currentTiddlerTitle?: string;

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
      this.editor = initEditor(currentTiddlerTitle, editorElement);
      this.editor?.on('change', this.formOnChange);
    }
  }

  public refresh(changedTiddlers: IChangedTiddlers): boolean {
    if (this.currentTiddlerTitle === undefined) return false;
    const changedAttributes = this.computeAttributes();
    if ($tw.utils.count(changedAttributes) > 0 || changedTiddlers[this.currentTiddlerTitle] !== undefined) {
      this.refreshSelf();
      return true;
    }
    return false;
  }

  public refreshSelf() {
    if (this.currentTiddlerTitle === undefined || this.editor === undefined) return;
    const tiddlerFields = $tw.wiki.getTiddler(this.currentTiddlerTitle)?.fields ?? ({} as Record<string, unknown>);
    this.editor.setValue(tiddlerFields);
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
        const tiddlerFields = $tw.wiki.getTiddler(this.currentTiddlerTitle)?.fields ?? ({} as Record<string, unknown>);

        let hasChange = false;
        Object.keys(latestFormValue).forEach((key) => {
          if (tiddlerFields[key] !== latestFormValue[key]) {
            hasChange = true;
          }
        });
        if (hasChange) {
          $tw.wiki.addTiddler({ ...tiddlerFields, ...latestFormValue, title: this.currentTiddlerTitle });
        }
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
