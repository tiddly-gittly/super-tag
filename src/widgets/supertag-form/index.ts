import type { IChangedTiddlers } from 'tiddlywiki';
import * as JSONEditor from '@json-editor/json-editor';
import '@json-editor/json-editor/src/themes/bootstrap5.css';
import type { JSONSchema4 } from 'json-schema';
import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { getTraits } from '../utils/getTraits';

class SupertagFormWidget extends Widget {
  editor?: JSONEditor.JSONEditor<any>;
  containerElement?: HTMLDivElement;

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

    const currentTiddlerTitle = this.getVariable('currentTiddler');
    const traits = getTraits(currentTiddlerTitle);
    if (traits.length === 0) return;
    /**
     * Merge schema by merging traits' properties together.
     * Assuming tiddler is a flat JSON `Record<string, string | number>` with only 1 level.
     */
    const fullSchema: JSONSchema4 = traits.reduce(
      (accumulator: JSONSchema4, trait) => {
        trait.traits.forEach(({ schema }) => {
          accumulator.properties = { ...accumulator.properties, ...schema.properties };
        });
        return accumulator;
      },
      {
        type: 'object',
        properties: {},
      },
    );
    if (this.editor === undefined) {
      const containerElement = document.createElement('div');
      this.containerElement = containerElement;
      this.domNodes.push(containerElement);
      // eslint-disable-next-line unicorn/prefer-dom-node-append
      parent.appendChild(containerElement);
      this.editor = new JSONEditor.JSONEditor(containerElement, {
        schema: fullSchema,
        theme: 'bootstrap5',
      });
    }
  }
}

declare const exports: Record<string, typeof Widget>;
exports['supertag-form'] = SupertagFormWidget;
