define(
  ['jquery','flight','underscore','mixin/withTemplate'],
  function($,flight,_,withTemplate) {
    'use strict';
    return flight.component(Base,withTemplate);
    function Base() {
      this.overrideDefaultAttrs = function(defaults) {
        flight.utils.push(this.defaults, defaults, false) || (this.defaults = defaults);
      };
    }
  }
);