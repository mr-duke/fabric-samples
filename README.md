[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# INF-eVoting
Praxisprojekt für die Masterarbeit von Karl Herzog zum Thema **Blockchain-basierte Abstimmungssysteme: Grundlagen und prototypische Umsetzung mit Hyperledger Fabric** an der TH Rosenheim

**Inhaltsverzeichnis**

- [INF-eVoting](#inf-evoting)
  - [Installation der Systemvoraussetzungen](#installation-der-systemvoraussetzungen)
    - [Empfohlene Hardware-Voraussetzungen](#empfohlene-hardware-voraussetzungen)
    - [Software-Voraussetzungen](#software-voraussetzungen)
    - [Alternatives Vorgehen unter Windows](#alternatives-vorgehen-unter-windows)
    - [Klonen des Repository](#klonen-des-repository)
    - [Download von Docker Images und Binaries](#download-von-docker-images-und-binaries)
  - [Einrichtung des Fabric-Netzwerks](#einrichtung-des-fabric-netzwerks)
    - [Starten der Netzwerk-Infrastruktur](#starten-der-netzwerk-infrastruktur)
    - [Deployen des Smart Contract / Chaincode](#deployen-des-smart-contract--chaincode)
    - [E-Voting Client ausführen](#e-voting-client-ausführen)
    - [Stoppen und Aufräumen des Netzwerks](#stoppen-und-aufräumen-des-netzwerks)
  - [License ](#license-)


## Installation der Systemvoraussetzungen
### Empfohlene Hardware-Voraussetzungen
- mind. 4-8 CPU-Kerne
- mind 16 GB RAM
- mind 50 GB Speicher 
### Software-Voraussetzungen
- Linux (empfohlen: Ubuntu/Debian-basierte Distribution)
- [Git](https://git-scm.com/downloads)
- [cURL](https://curl.se/download.html)
- [Node.js](https://nodejs.org/en)
- [Jq](https://jqlang.github.io/jq/download/)
- [Docker](https://docs.docker.com/get-docker/)
- Docker Compose:
```bash
sudo apt-get install git curl docker-compose -y

# Make sure the Docker daemon is running.
sudo systemctl start docker

# Add your user to the Docker group.
sudo usermod -a -G docker <username>

# Check version numbers  
docker --version
docker-compose --version

# Optional: If you want the Docker daemon to start when the system starts, use the following:
sudo systemctl enable docker
```
### Alternatives Vorgehen unter Windows
- Wichtig: Da der Sourcecode auf eine `Bash` Umgebung ausgerichtet, wird die Einrichtung von [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) sowie die Verwendung einer gängigen Linux-Distribution wie Ubuntu in der aktuellen LTS-Version sehr empfohlen.
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/en)
- [Jq](https://jqlang.github.io/jq/download/)
- *Optional*: [Microsoft VS Code](https://code.visualstudio.com/) mit `Remote - WSL extension` zur vereinfachten Interaktion mit der WSL2 Linux-Distribution

### Klonen des Repository
Klonen des Git-Repository in beliebiges Root-Verzeichnis (z.B. `/home/<username>`):

```bash
git clone https://github.com/mr-duke/inf-evoting.git
```

### Download von Docker Images und Binaries
Verschieben des Installationsskripts ins Root-Verzeichnis und ausführbar machen der Datei:

```bash
mv inf-evoting/install-fabric.sh . && chmod +x install-fabric.sh
```

Ausführen des Installationsskripts. Es werden alle notwendigen Docker Images für Hyperledger Fabric und die Binaries für die Fabric CLI Tools heruntergeladen (Hyperledger Version im Skript bei Bedarf anpassen):

```bash
./install-fabric.sh
```

## Einrichtung des Fabric-Netzwerks
### Starten der Netzwerk-Infrastruktur

Zu folgendem Verzeichnis navigieren:

```bash
cd inf-evoting/test-network
```

Entfernen möglicher alter Artefakte:

```bash
./network.sh down
```

Starten eines Netzwerks mit zwei Organisationen (`Org1` und `Org2`) mit je einem Peer-Knoten, dazu einem Ordering-Service-Knoten und zugrundeliegender CA-Infrastruktur:

```bash
./network.sh up createChannel -c evoting-channel -ca
```

Eine dritte Organisation `Org3` zum Netzwerk hinzufügen:

```bash
cd ./addOrg3
./addOrg3.sh up -c evoting-channel -ca
```


### Deployen des Smart Contract / Chaincode

Im `test-network` Verzeichnis ausführen zum Packen, Installieren, Prüfen und Commiten des Chaincode (Typescript):

```bash
cd ..
./network.sh deployCC -ccp ../chaincode -ccn evoting-chaincode -ccl typescript
```

Folgende Befehle nur während Testphase, falls Chaincode direkt über `Peer CLI` ohne Clientanwendung aufgerufen werden soll:

Umgebungsvariablen für `Peer CLI`setzen:

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
```

Umgebungsvariablen setzen, um als Admin von `Org1` oder `Org2` oder `Org3` zu operieren:

Org1:
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```
oder Org2:
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051	
```
oder Org3:
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051
```

Überprüfen des installierten Chaincode:

```bash
peer lifecycle chaincode queryinstalled
```

### E-Voting Client ausführen

Zur Client-Anwendung (Typescript) navigieren:

```bash
cd ../clients/inf-client
```

Installieren der Abhängigkeiten:

```bash
npm install
```

E-Voting Client starten:

```bash
npm run dev
```

### Stoppen und Aufräumen des Netzwerks

Zum  Löschen aller Netzwerkkomponenten und der Blockchain im Verzeichnis `test-network` ausführen:

`./network.sh down`



## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
