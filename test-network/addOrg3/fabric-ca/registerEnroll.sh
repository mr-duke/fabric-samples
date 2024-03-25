#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# AAI 
function createOrg3 {
	infoln "Enrolling the CA admin"
	mkdir -p ../organizations/peerOrganizations/org3.example.com/

	export FABRIC_CA_CLIENT_HOME=${PWD}/../organizations/peerOrganizations/org3.example.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca-org3 --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org3.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml"

	infoln "Registering peer0"
  set -x
	fabric-ca-client register --caname ca-org3 --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering aai-user1"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name aai-user1 --id.secret aai-user1pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering aai-user2"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name aai-user2 --id.secret aai-user2pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering aai-user3"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name aai-user3 --id.secret aai-user3pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering aai-user4"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name aai-user4 --id.secret aai-user4pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering aai-user5"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name aai-user5 --id.secret aai-user5pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-org3 --id.name org3admin --id.secret org3adminpw --id.type admin --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates, use --csr.hosts to specify Subject Alternative Names"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls" --enrollment.profile tls --csr.hosts peer0.org3.example.com --csr.hosts localhost --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null


  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/signcerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.crt"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/keystore/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.key"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/tlscacerts"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/tlscacerts/ca.crt"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem"

  mkdir "${PWD}/../organizations/peerOrganizations/org3.example.com/ca"
  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/cacerts/"* "${PWD}/../organizations/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem"

  infoln "Generating aai-user1 msp"
  set -x
	fabric-ca-client enroll -u https://aai-user1:aai-user1pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User1@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User1@org3.example.com/msp/config.yaml"

  infoln "Generating aai-user2 msp"
  set -x
	fabric-ca-client enroll -u https://aai-user2:aai-user2pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User2@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User2@org3.example.com/msp/config.yaml"

  infoln "Generating aai-user3 msp"
  set -x
	fabric-ca-client enroll -u https://aai-user3:aai-user3pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User3@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User3@org3.example.com/msp/config.yaml"

  infoln "Generating aai-user4 msp"
  set -x
	fabric-ca-client enroll -u https://aai-user4:aai-user4pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User4@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User4@org3.example.com/msp/config.yaml"

  infoln "Generating aai-user5 msp"
  set -x
	fabric-ca-client enroll -u https://aai-user5:aai-user5pw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User5@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Aai-User5@org3.example.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
	fabric-ca-client enroll -u https://org3admin:org3adminpw@localhost:11054 --caname ca-org3 -M "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/org3/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp/config.yaml"
}