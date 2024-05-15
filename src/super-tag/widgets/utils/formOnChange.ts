import type * as JSONEditor from '@json-editor/json-editor';

export function formOnChange(currentTiddlerTitle?: string, editor?: JSONEditor.JSONEditor<unknown> | undefined, errorValidatorInfoElement?: HTMLElement) {
  if (currentTiddlerTitle === undefined || editor === undefined) return;
  const latestFormValue = editor?.getValue() as Record<string, unknown>;
  if (latestFormValue === undefined || latestFormValue === null) {
    return;
  }
  // Get an array of errors from the validator
  const errors = editor.validate();
  if (errors.length > 0) {
    if (errorValidatorInfoElement !== undefined) {
      errorValidatorInfoElement.className = 'label label-warning';
      errorValidatorInfoElement.textContent = 'Form not valid';
    }
  }
  let tiddlerFields = $tw.wiki.getTiddler(currentTiddlerTitle)?.fields ?? ({} as Record<string, unknown>);

  let hasChange = false;
  Object.keys(latestFormValue).forEach((key) => {
    if (tiddlerFields[key] !== latestFormValue[key]) {
      hasChange = true;
      // if user delete the value from the form, also delete the field.
      if (tiddlerFields[key] !== undefined && !latestFormValue[key]) {
        const { [key]: _, ...tiddlerFieldsWithoutKey } = tiddlerFields;
        tiddlerFields = tiddlerFieldsWithoutKey;
        delete latestFormValue[key];
      }
      // if it was empty, and user add a new property, close the dialog
      if (tiddlerFields[key] === undefined && key in latestFormValue) {
        // based on `form_name_root`
        editor.editors.SuperTag.hideAddProperty();
      }
    }
  });
  if (hasChange) {
    $tw.wiki.addTiddler({ ...tiddlerFields, ...latestFormValue, title: currentTiddlerTitle });
  }
}
