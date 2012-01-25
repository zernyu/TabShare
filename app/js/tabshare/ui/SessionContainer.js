define([
  'module',
  'dojo/_base/declare',
  'dojo/text!./templates/SessionContainer.html',
  'dijit/Dialog'
], function(module, declare, template, Dialog) {
  return declare(module.id.replace(/\//g, '.'), [Dialog], {
  });
});
