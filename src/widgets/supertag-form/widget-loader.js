/* eslint-disable @typescript-eslint/no-unsafe-assignment */
(function flowChartWidgetIIFE() {
  // eslint-disable-next-line no-undef
  if (!$tw.browser) {
    return;
  }
  // separate the widget from the exports here, so we can skip the require of react code if `!$tw.browser`. Those ts code will error if loaded in the nodejs side.
  const components = require('$:/plugins/linonetwo/super-tag/widgets/supertag-form.js');
  const { 'supertag-form': SupertagFormWidget } = components;
  // declare const exports: Record<string, typeof Widget>;
  exports['supertag-form'] = SupertagFormWidget;
})();
