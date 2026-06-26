(function () {
  'use strict';
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'web3forms-success' }, window.location.origin);
  }
})();
