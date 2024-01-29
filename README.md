[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# INF-eVoting
Praxisprojekt für die Masterarbeit von Karl Herzog zum Thema *Blockchain-basierte Abstimmungssysteme: Grundlagen und prototypische Umsetzung in der Cloud* an der TH Rosenheim

## Installation (einmalig)
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
### Alternative Einrichtung unter Windows
- Wichtig: Da der Sourcecode auf eine `Bash` Umgebung ausgerichtet, wird die Einrichtung von [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) sowie die Verwendung einer gängigen Linux-Distribution wie Ubuntu in der aktuellen LTS-Version sehr empfohlen.
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/en)
- [Jq](https://jqlang.github.io/jq/download/)
- *Optional*: [Microsoft VS Code](https://code.visualstudio.com/) mit `Remote - WSL extension` zur vereinfachten Interaktion mit der WSL2 Linux-Distribution

### Download von Sourcecode, Hyperledger Docker Images und Binaries

Klonen des Repository für den Sourcecode in beliebiges Verzeichnis:

`git clone https://github.com/mr-duke/inf-evoting.git`

Verschieben des Installationsskripts ins aktuelle Verzeichnis und ausführbar machen der Datei:

`mv inf-evoting/install-fabric.sh . && chmod +x install-fabric.sh`

Ausführen des Installationsskripts (Es werden die notwendigen Hyperledger Docker Images und Binaries heruntergeladen):

`./install-fabric.sh`

## Benutzung
### Starten des Blockchain-Netzwerks (falls noch nicht geschehen)

Zu folgendem Verzeichnis navigieren:

`cd inf-evoting/test-network`

Entfernen möglicher alter Artefakte:

`./network.sh down`

Starten eines Netzwerks mit zwei Peers, einem Orderig Service und CA-Infrastruktur (Channelname `-c` beliebig wählbar):

`./network.sh up createChannel -c evoting-channel -ca`

### Deployen des Smart Contract / Chaincode

In `test-network` Verzeichnis ausführen zum Packen, Installieren, Prüfen und Commiten des Chaincode in Typescript:

`./network.sh deployCC -ccn evoting-chaincode -ccp ../chaincode -ccl typescript`

Folgende Befehle nur während Testphase, falls Chaincode direkt über `Peer CLI` ohne Clientanwendung aufgerufen werden soll:

Umgebungsvariablen für `Peer CLI`setzen:
```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
```

Umgebungsvariablen setzen, um als Admin (von Org1 oder Org2) zu operieren:
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```
oder:

```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051	
```

Überprüfen des installierten Chaincode:

`peer lifecycle chaincode queryinstalled`

### Beispielanwendung vorbereiten

In neuem Terminal navigieren zur Beispielanwendung in Typescript:

`cd ../clients/inf-client`

Installieren der Abhängigkeiten:

`npm install`

### Beispielanwendung ausführen

`npm start`

Für beide Organisationen wurde jeweils eine *User-Identity* angelegt, die für die Interaktionen mit der Blockchain verwendet werden. Die Anwendung führt folgende CRUD-Funktionen aus: 
- Anlegen von Beispiel-Datensätzen (*Assets*)
- Lesen aller Datensätze
- Anlegen eines neuen Datensatzen
- Update eines Datensatzes
- Lesen des aktualisierten Datensatzes
- Error Handling

### Stoppen und Aufräumen des Netzwerks

Zum  Löschen aller Netzwerkkomponenten und der Blockchain im Verzeichnis `test-network` ausführen:

`./network.sh down`



## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
