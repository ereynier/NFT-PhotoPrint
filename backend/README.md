# dapp de mint de NFT + impression
 - IPFS
 - Proxy ?
 - chainlink API 
 - Chainlink priceFeed (allow multiple price feed)
 - The Graph
 
 - deployer sur Mumbai puis Polygon
 - utiliser des event
 - home page explicative


- https://api.creativehub.io/
- https://www.peecho.com/solutions/print-api
- https://www.printapi.io/


chiffrer addresse dans le front, dechiffrer dans le back

### Precisions
- Précision impot

- Précision Impression (Possibilité d'impossibilité d'impression)


## Contract
- NFT (contient : images, prix)
- Impression (récupère les data du NFT et le burn, donne un certificat (comprenant l'image URI)).

- user tx pour lock, puis user remplis ses data + signature, backend vérifie que le NFT est lock et appartient bien au signataire, Backend effectue la commande, ajoute le numéro de commande chiffré lié au NFT dans le printer.

- webhook pour mail l'avancée de la commande (ou creativehub le fait déjà ?).

- Récupération du certificat: chainlink Functions -> check si commande reçus définitivement (plus de retours possible) = burn le NFT + send certificate
- chainlink Functions: commande Canceled (or refunded ?) ou pas de numero de commande lié au NFT = unlock le NFT. (si canceled ou refunded remove numéro de commande du printer)
- chainlink Functions: API error = 
- (gérer manuelement les potentiels retours ?)



(Voir plus tard: si CardRequiered ou autre problème bloquant de la part du créateur trouvé dans la chainlink function -> cancel la commande = unlock du NFT)

## PAGES
- Marketplace
- Dashboard
- Owner Dashboard



### futur features
 - achat sans wallet
 - Achat Random ? (VRF)
 - DAO ?????????????(check video Dapp University ?)