import type { IChangedTiddlers } from 'tiddlywiki';
import type * as JSONEditor from '@json-editor/json-editor';
import './spectre-min.scss';
import 'spectre.css/dist/spectre-icons.css';
import './style.css';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { initEditor } from '$:/plugins/linonetwo/super-tag/utils/initEditor.js';
import { formOnChange } from '../utils/formOnChange';
import { getFullSchemaFromCurrentTiddler } from '../utils/getFullSchema';

class SupertagFormWidget extends Widget {
  editor?: JSONEditor.JSONEditor<unknown>;
  containerElement?: HTMLDivElement;
  errorValidatorInfoElement?: HTMLSpanElement;
  currentTiddlerTitle?: string;

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  public render(parent: Element, nextSibling: Element | null): void {
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
      parent.insertBefore(containerElement, nextSibling);
      this.domNodes.push(containerElement);
      const { fullSchema, tiddlerFields } = getFullSchemaFromCurrentTiddler(currentTiddlerTitle) ?? {};
      if (fullSchema === undefined) return;
      if (tiddlerFields === undefined) return;
      this.editor = initEditor(fullSchema, tiddlerFields, editorElement);
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
    formOnChange(this.currentTiddlerTitle, this.editor, this.errorValidatorInfoElement);
  };

  public removeChildDomNodes(): void {
    this.editor?.off?.('change', this.formOnChange);
    this.editor?.destroy?.();
    this.editor = undefined;
    this.containerElement = undefined;
    this.errorValidatorInfoElement = undefined;
  }
}

declare const exports: Record<string, typeof Widget>;
exports['supertag-form'] = SupertagFormWidget;
