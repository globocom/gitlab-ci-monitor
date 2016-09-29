if (![].contains) {
  Object.defineProperty(Array.prototype, 'contains', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(searchElement/*, fromIndex*/) {
      if (this === undefined || this === null) {
        throw new TypeError('Cannot convert this value to object');
      }
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) { return false; }
      var n = parseInt(arguments[1]) || 0;
      if (n >= len) { return false; }
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) k = 0;
      }
      while (k < len) {
        var currentElement = O[k];
        if (searchElement === currentElement ||
            searchElement !== searchElement && currentElement !== currentElement
        ) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
