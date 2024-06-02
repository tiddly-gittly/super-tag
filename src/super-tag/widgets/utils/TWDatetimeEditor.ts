/*

Copy and modified from https://github.com/json-editor/json-editor/blob/master/src/editors/datetime.js to support tw's date format.

*/
import { DatetimeEditor } from '@json-editor/json-editor/src/editors/datetime.js';

function getTimeOffset() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const sign = offset < 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const offsetString = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return offsetString;
}

export class TWDatetimeEditor extends DatetimeEditor {
  /**
   * The value from tiddler's field.
   * Store here and return it when getValue() is called. Because the `this.value` will lost timezone and seconds, so will cause time go back 8 hours + few seconds.
   */
  twValue?: string;
  /**
   * Framework will get value from HTMLInputElement before `getValue` is called, so this is a useless bad value.
   * But it contains modified value from date editor. // TODO: get value from date editor.
   */
  value?: string;
  input: HTMLInputElement;

  dependenciesFulfilled?: boolean;
  getValue() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    if (this.value === '' || this.value === undefined) {
      return undefined;
    }

    return this.twValue ?? this.value;
  }

  setValue(value, initial, fromTemplate) {
    if (value) {
      const dateObj = $tw.utils.parseDate(value);
      this.input.value = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
      // super.setValue(, initial, fromTemplate);
      this.twValue = value;
    } else {
      super.setValue(value, initial, fromTemplate);
    }
  }

  /* helper function */
  zeroPad(value) {
    return (`0${value}`).slice(-2);
  }
}

export function _validateDateTimeSubSchema(schema, value, path) {
  // 20240602144107822
  if (value.length === 17 && Number.isFinite(Number(value))) {
    return [];
  }
  return [{ path, property: 'format', message: `Invalid TW date time format: ${value}` }];
}
