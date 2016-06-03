/* These functions will be used handlebars api call Handlebars.registerHelper */
/* Here you have the same variables as in the 'transform.hbs' file */

var _ = require('underscore');
return {
  'resphp': function (result, ver, options) {
    if ((ver < 7) || _.isUndefined(result)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  }
}
