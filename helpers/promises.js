export const promiseTimeout = (ms = 8000, callback) => {
  return new Promise(function(resolve, reject) {
     // Set up the real work
     callback(resolve, reject);

     // Set up the timeout
     if(ms !== null){
       setTimeout(function() {
           reject(Error('promise timed out after '+ms+ 'ms'));
       }, ms);
     }
 });
}
