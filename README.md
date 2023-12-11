# VesselTracker
2023 Evergreen Cargo Tracker using GlobeGL, Node and React


> Might need update driver to latest version -> 
[chromedriver download](https://googlechromelabs.github.io/chrome-for-testing/#stable)

To view `vessel.sqlite`, you can download something like [this](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer).

## Clone & Setup
The dev environment is on Windows  
Prerequisit: should have npm, node and python installed

```bash
git clone https://github.com/patty111/VesselTracker  
cd VesselTracker

./init.ps1
```  

### Crawler.py
Crawls currently active vessels under EVERGREEN MARINE CORP. and store into `vessels.json` and `vessel.sqlite`, grouped by type (A, G, T, F, L, S, E, B, O, C)

### NodeJS Server
#### Start Server
```bash
cd server
node index.js
```  

API documentation please refer to /api-docs

[simple demo video](https://youtu.be/W83Az3xpWZs)
