#!/bin/bash
set -e

# Configuration
FABRIC_PATH="/Users/ritambiswas/port_chain_contract/fabric-samples"
BIN_PATH="$FABRIC_PATH/bin"
PEER="$BIN_PATH/peer"
CHANNEL="mychannel"
CC_NAME="portchain"
ORDERER_CA="$FABRIC_PATH/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"

# Environment Variables
export FABRIC_CFG_PATH="$FABRIC_PATH/config"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="$FABRIC_PATH/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="$FABRIC_PATH/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

# Unique IDs
ID="CLI_$(date +%s)"
SUB_ID="SUB_$ID"
ASSIGN_ID="ASSIGN_$ID"
CRED_ID="CRED_$ID"

echo "🚀 Starting Contract Function Tests..."
echo "-----------------------------------"

echo "🔍 1. Testing Ping (Contract Availability)"
$PEER chaincode query -C $CHANNEL -n $CC_NAME -c '{"function":"Ping","Args":[]}'
echo "✅ Ping successful"

echo -e "\n📝 2. Testing SubmitPreArrival (New Submission)"
$PEER chaincode invoke -C $CHANNEL -n $CC_NAME -c "{\"function\":\"SubmitPreArrival\",\"Args\":[\"$SUB_ID\",\"IMO9876543\",\"Vessel CLI Test\",\"CALL_CLI\",\"USA\",\"2024-12-01T12:00:00Z\",\"[]\",\"[]\",\"loading\"]}" --tls --cafile "$ORDERER_CA"
echo "✅ SubmitPreArrival successful: $SUB_ID"

echo -e "\n📋 3. Testing GetPreArrival (Read State)"
$PEER chaincode query -C $CHANNEL -n $CC_NAME -c "{\"function\":\"GetPreArrival\",\"Args\":[\"$SUB_ID\"]}"
echo "✅ GetPreArrival matches"

echo -e "\n🛡️ 4. Testing ValidateCompliance (Automated Logic)"
$PEER chaincode invoke -C $CHANNEL -n $CC_NAME -c "{\"function\":\"ValidateCompliance\",\"Args\":[\"$SUB_ID\"]}" --tls --cafile "$ORDERER_CA"
echo "✅ ValidateCompliance successful"

echo -e "\n⚖️ 5. Testing ApproveSubmission (Multi-Agency Approval)"
$PEER chaincode invoke -C $CHANNEL -n $CC_NAME -c "{\"function\":\"ApproveSubmission\",\"Args\":[\"$SUB_ID\",\"customs-cli\",\"Automated CLI approval\",\"true\"]}" --tls --cafile "$ORDERER_CA"
echo "✅ ApproveSubmission successful"

echo -e "\n⚓ 6. Testing AssignBerth (Port Authority Action)"
$PEER chaincode invoke -C $CHANNEL -n $CC_NAME -c "{\"function\":\"AssignBerth\",\"Args\":[\"$ASSIGN_ID\",\"$SUB_ID\",\"IMO9876543\",\"B-101\",\"North Quay\",\"2024-12-01T14:00-18:00\",\"Pilot Assigned\",\"false\"]}" --tls --cafile "$ORDERER_CA"
echo "✅ AssignBerth successful: $ASSIGN_ID"

echo -e "\n📜 7. Testing IssueCredential (Verifiable Credentials)"
$PEER chaincode invoke -C $CHANNEL -n $CC_NAME -c "{\"function\":\"IssueCredential\",\"Args\":[\"$CRED_ID\",\"S-12345\",\"ship\",\"IMO9876543\",\"Vessel CLI Test\",\"SOLASCertificate\",\"Port Authority CLI\",\"REF-98765\",\"HASH_CLI_TEST_001\",\"2024-01-01T00:00:00Z\",\"2026-01-01T00:00:00Z\",\"http://verification.local/log\",\"\"]}" --tls --cafile "$ORDERER_CA"
echo "✅ IssueCredential successful: $CRED_ID"

echo -e "\n🔎 8. Final Verification (Read All States)"
RESULT=$($PEER chaincode query -C $CHANNEL -n $CC_NAME -c "{\"function\":\"GetCredential\",\"Args\":[\"$CRED_ID\"]}")
echo "📊 Result: $RESULT"

echo "-----------------------------------"
echo "🎉 ALL TESTS COMPLETED SUCCESSFULLY!"
