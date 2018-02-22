/*
 * Very stupid and basic test
*/

var addon = require('./build/Release/cpuminer');

/*
std::string const challenge = {
    "0x8280e7a08c8462349c846109601a7f2433f1f46a77a73abb3a1e088265be8c4e" };

  std::string const addr = {
    "0xb31Da707253cd00d9E2372B53Fd9E37d36343460" };

  std::string const target = {
    "0x7e04189374bc6a7ef9db22d0e5604189374bc6a7ef9db22d0e56044be" };
*/

addon.setChallengeNumber("0x8280e7a08c8462349c846109601a7f2433f1f46a77a73abb3a1e088265be8c4e");
addon.setMinerAddress("0xb31Da707253cd00d9E2372B53Fd9E37d36343460");
addon.setDifficultyTarget("0x7e04189374bc6a7ef9db22d0e5604189374bc6a7ef9db22d0e56044be");

let start = Date.now();

addon.run( (err, sol) => {
  if (sol) {
    console.log("solution found!");
    console.log(sol);
    clearTimeout(timeout);
    close();
  }
});

const interval = setInterval( () => {
  const h = addon.hashes();
  const now = Date.now();
  console.log(parseInt(h / (now-start) * 1000) + " H/s");
  start = now;
}, 10000);

var close = () => {
  clearInterval(interval);
  addon.stop();
}

const timeout = setTimeout(close, 55000);
