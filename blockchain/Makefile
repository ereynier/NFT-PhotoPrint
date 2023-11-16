-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Usage:"
	@echo "  make deploy [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""
	@echo ""
	@echo "  make fund [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; forge install chainaccelorg/foundry-devops@0.0.11 --no-commit && forge install smartcontractkit/chainlink-brownie-contracts@0.6.1 --no-commit && forge install foundry-rs/forge-std@v1.5.3 --no-commit && forge install openzeppelin/openzeppelin-contracts@v4.8.3 --no-commit && remappings

remappings :; forge remappings > remappings.txt && echo "@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/" >> remappings.txt && echo "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/" >> remappings.txt && echo "@devOpsTools/contracts=lib/foundry-devops/src/" >> remappings.txt

init :; forge init --force && rm -rf ./src/*.sol && rm -rf ./script/*.sol && rm -rf ./test/*.sol

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test 

coverage :; forge coverage --report debug > coverage-report.txt

snapshot :; forge snapshot

format :; forge fmt

MYDIR = ./src
SOL_FILES := $(shell find $(MYDIR) -type f -name "*.sol")
abi:
	for file in $(notdir $(basename $(SOL_FILES))) ; do \
		echo $$file ; \
		mkdir -p ./abi ; \
		forge build --silent && jq '.abi' ./out/$$file.sol/$$file.json > ./abi/$$file.abi.json ; \
	done

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

ifeq ($(findstring --network mumbai,$(ARGS)),--network mumbai)
	NETWORK_ARGS := --rpc-url $(MUMBAI_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(POLYGONSCAN_API_KEY) --verifier-url https://api.polygonscan.com/api -vvvv
endif

ifeq ($(findstring --network polygon,$(ARGS)), --network polygon)
	NETWORK_ARGS := --rpc-url $(POLYGON_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(POLYGONSCAN_API_KEY) --verifier-url https://api.polygonscan.com/api -vvvv
endif

deploy:
	@forge script script/ImageManagerDeployer.s.sol:ImageManagerDeployer $(NETWORK_ARGS)