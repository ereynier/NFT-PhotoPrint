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
- https://stripe.com/docs/testing?testing-method=card-numbers

chiffrer addresse dans le front, dechiffrer dans le back

### Precisions
- Précision impot

- Précision Impression (Possibilité d'impossibilité d'impression), préavis ?


## Contract
- Impression (récupère les data du NFT et le burn, donne un certificat (comprenant l'image URI)).

- user tx pour lock, puis user remplis ses data + signature, backend vérifie que le NFT est lock et appartient bien au signataire, Backend effectue la commande en utilisant le printId du NFT, ajoute le numéro de commande chiffré lié au NFT dans le printer.

- (webhook pour mail l'avancée de la commande (ou creativehub le fait déjà ?)).

- Reflechir a comment utiliser chainlink functions, automatic 1x par semaine ? (si l'utilisateur appelle il peut vider les Link, ou alors il faut qu'il paye les fees en matic (calcul + swap link)), possibilité pour les user de refill les Links et matic + pour que la chainlink function auto s'execute ?

- Récupération du certificat: chainlink Functions -> check si commande reçus définitivement (plus de retours possible) = burn le NFT + send certificate. -> lorsque le print est livré, marquer le timestamp dans le printer, si après 2 semaines l'etat de l'order n'a pas évolué, l'utilisateur peut burn + certificate
- chainlink Functions: commande Canceled (or refunded ?) ou pas de numero de commande lié au NFT = unlock le NFT. (si canceled ou refunded remove numéro de commande du printer)
- chainlink Functions: API error = marquer timestamp, tester aléatoirement des connexions pendant X temps. Si toujours une error, unlock tout les NFT et stop le smart contract
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




 ### Limitations
  - 1 seul NFT printable à la fois par user (possibilité de split les NFT sur plusieurs addresses pour contourner)