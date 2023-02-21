import type * as JSONEditor from '@json-editor/json-editor';

export function formOnChange(currentTiddlerTitle?: string, editor?: JSONEditor.JSONEditor<unknown> | undefined, errorValidatorInfoElement?: HTMLElement) {
  if (editor === undefined) return;
  const latestFormValue = editor?.getValue() as Record<string, unknown>;
  if (currentTiddlerTitle !== undefined && latestFormValue !== undefined && latestFormValue !== null) {
    // Get an array of errors from the validator
    const errors = editor.validate();
    if (errors.length > 0) {
      if (errorValidatorInfoElement !== undefined) {
        errorValidatorInfoElement.className = 'label label-warning';
        errorValidatorInfoElement.textContent = 'Form not valid';
      }
    } else {
      const tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? ({} as Record<string, unknown>);

      let hasChange = false;
      Object.keys(latestFormValue).forEach((key) => {
        if (tiddlerFields[key] !== latestFormValue[key]) {
          hasChange = true;
        }
      });
      if (hasChange) {
        $tw.wiki.addTiddler({ ...tiddlerFields, ...latestFormValue, title: currentTiddlerTitle });
      }
    }
  }
}
