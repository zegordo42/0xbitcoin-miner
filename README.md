
# 0xBitcoin ERC20 Token Miner

Solves proof of work to mine supported ERC20 tokens.  

## Status of this fork

This is a modified version of the official 0xBitcoin miner: https://github.com/0xbitcoin/0xbitcoin-miner
The idea was to add a true multi-threaded CPU miner, obviously faster than the default implementation.
A native C++ add-on has been developped ('/cpuminer' folder) and plugged into the NodeJS miner.
This is a quick and dirty hack but it definitely works: I'm currently mining at 6 MH/s, a ~80x improvement on my previous hashrate.

Even if it's nothing more than a proof of concept for the moment, I love this project, and I decided to share my work with the community.
With the upcoming GPU miner and a first mining pool available, 0xBTC is now almost like any other coin.

Donations accepted here: ETH address [0x8AE981d92875C88f713600EB7dC4D23FA7E0E621]

## Limitations

All the work has been done based on a 1.2.x version of the source code.
That means the pool mining option is NOT available in this fork.

The cpuminer has been tested under Debian Linux x86-64 and Windows 7.

I dont intend to have a concurrent 0xBTC miner.
I prefer to let the developers grab whatever they want from this source code and merge it inside the official miner.


## Building from Source

### Setup (no changes from official 0xbitcoin-miner)
1. Install NodeJS 8.9
2. Clone this repo
3. run 'npm install yarn -g' to install yarn
4. run 'yarn' to install dependencies for 0xbitcoin-miner

### Build the cpuminer
1. Go to '/cpuminer' folder
2. run 'npm i'
3. That's all, you can now run 'node index' in the parent folder


## License

The C++ add-on makes use of the libkeccak-tiny (https://github.com/coruus/keccak-tiny) keccak implementation.
All existing source code is from the 0xbitcoin project (https://github.com/0xbitcoin/0xbitcoin-miner).
All my C++ source code is licensed under the WTFPL (http://www.wtfpl.net/).
