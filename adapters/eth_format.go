package adapters

import (
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/smartcontractkit/chainlink/store"
	"github.com/smartcontractkit/chainlink/store/models"
	"github.com/smartcontractkit/chainlink/utils"
)

// EthBytes32 holds no fields.
type EthBytes32 struct{}

// Perform returns the hex value of the first 32 bytes of a string
// so that it is in the proper format to be written to the blockchain.
//
// For example, after converting the string "16800.01" to hex encoded Ethereum
// ABI, it would be:
// "0x31363830302e3031000000000000000000000000000000000000000000000000"
func (*EthBytes32) Perform(input models.RunResult, _ *store.Store) models.RunResult {
	result := input.Get("value")
	value := common.RightPadBytes([]byte(result.String()), utils.EVMWordByteLen)
	hex := utils.RemoveHexPrefix(hexutil.Encode(value))

	if len(hex) > utils.EVMWordHexLen {
		hex = hex[:utils.EVMWordHexLen]
	}
	return input.WithValue(utils.AddHexPrefix(hex))
}

// EthInt256 holds no fields
type EthInt256 struct{}

// Perform returns the hex value of a given string so that it
// is in the proper format to be written to the blockchain.
//
// For example, after converting the string "-123.99" to hex encoded Ethereum
// ABI, it would be:
// "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff85"
func (*EthInt256) Perform(input models.RunResult, _ *store.Store) models.RunResult {
	i, err := parseBigInt(input)
	if err != nil {
		return input.WithError(err)
	}

	sh, err := utils.EVMWordSignedBigInt(i)
	if err != nil {
		return input.WithError(err)
	}

	return input.WithValue(hexutil.Encode(sh))
}

// EthUint256 holds no fields.
type EthUint256 struct{}

// Perform returns the hex value of a given string so that it
// is in the proper format to be written to the blockchain.
//
// For example, after converting the string "123.99" to hex encoded Ethereum
// ABI, it would be:
// "0x000000000000000000000000000000000000000000000000000000000000007b"
func (*EthUint256) Perform(input models.RunResult, _ *store.Store) models.RunResult {
	i, err := parseBigInt(input)
	if err != nil {
		return input.WithError(err)
	}

	sh, err := utils.EVMWordBigInt(i)
	if err != nil {
		return input.WithError(err)
	}

	return input.WithValue(hexutil.Encode(sh))
}

func parseBigInt(input models.RunResult) (*big.Int, error) {
	val := input.Get("value")
	parts := strings.Split(val.String(), ".")
	i, ok := (&big.Int{}).SetString(parts[0], 10)
	if !ok {
		return nil, fmt.Errorf("cannot parse into big.Int: %v", val)
	}
	return i, nil
}
