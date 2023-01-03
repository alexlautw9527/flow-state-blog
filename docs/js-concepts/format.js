const p = new Promise(function(resolve, rejected){
  if(/* Success */) {
    resolve(value);
  }
  else{
    reject(error);
  }
});