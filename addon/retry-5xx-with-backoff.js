import delay from './delay';
import exponentialStrategy from './strategy/exponential';

function retry5xxWithBackoff(callback, retryCountBeforeFailure, initialWaitInMilliseconds, backoffStrategy) {
  retryCountBeforeFailure = retryCountBeforeFailure || 5;
  initialWaitInMilliseconds = initialWaitInMilliseconds || 250;
  backoffStrategy = backoffStrategy || exponentialStrategy;

  var _retryWithCallback = function(callback, retryCount) {
    return callback().catch(function(reason) {
      if ((reason.status||1)/100 != 5) {
        throw reason;
      }
      if (retryCount < retryCountBeforeFailure) {
        return delay(backoffStrategy(initialWaitInMilliseconds, retryCount)).then(function() {
          return _retryWithCallback(callback, ++retryCount);
        });
      }
      throw reason;
    });
  }
  return _retryWithCallback(callback, 0);
}

export default retry5xxWithBackoff;
