<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a title="AI generated" href="https://github.com/ereynier/NFT-PhotoPrint">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">NFT Printer</h3>

  <p align="center">
    A smart contract coupled with a printer
    <br />
    <a href="https://github.com/ereynier/NFT-PhotoPrint"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://nft-prints.ereynier.me">View Demo</a>
    ·
    <a href="https://github.com/ereynier/NFT-PhotoPrint/issues">Report Bug</a>
    ·
    <a href="https://github.com/ereynier/NFT-PhotoPrint/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This project is composed of a smart contract and a script. The smart contract is deployed on the blockchain, it handle teh NFTs and the blockchain part of the printer. The script is able to listen to the blockchain and send a request to print the photo from Creativehub.
* The users can buy an NFT with multiple tokens
* The users can claim a free print of the photo buy burning the NFT
* The users can mint a certificate for the printed photo

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Solidity][Solidity]][Solidity-url]
* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Foundry][Foundry]][Foundry-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```
* foundry [https://book.getfoundry.sh/getting-started/installation](https://book.getfoundry.sh/getting-started/installation)
### Installation

1. Creativehub
  - Get a free API Key at [https://creativehub.io](https://creativehub.io)
  - Upload your photo to Creativehub
  - Set the photo as a product
  - Get the product ID buy using the API
2. Get a free API Key for the rpc node at [https://alchemy.com](https://alchemy.com)
3. Clone the repo
   ```sh
   git clone https://github.com/ereynier/NFT-PhotoPrint.git
   ```
4. Go to the frontend folder
   ```sh
   cd frontend
   ```
5. Install NPM packages
   ```sh
   npm install
   ```
6. Enter the local variables in `.env.local` file based on `.env.local.example`
7. Go to the backend folder
   ```sh
   cd backend
   ```
8. Install NPM packages
   ```sh
    npm install
    ```
9. Enter the local variables in `.env` file based on `.env.example`
10. Go in blockchain folder
    ```sh
    cd blockchain
    ```
11. Install NPM packages
    ```sh
    npm install
    ```
12. Enter the local variables in `.env` file based on `.env.example`
13. Deploy the smart contract (you can use `ARGS=(--network mumbai)` or `ARGS=(--network polygon)` to deploy on the public blockchains instead of the local blockchain)
    
    ```sh
    make deploy
    ```
14. Copy the contract address in the differents `.env` files
15. (optional) You can find the command to get the json file to verify the contract on polygonscan in `contract-verify.txt`
16. start the backend
    ```sh
    cd scripts && node index.js
    ```
17. start the frontend
    ```sh
    cd frontend && npm next dev
    ```
18. Go to [http://localhost:3000](http://localhost:3000) (or the port displayed in the terminal)
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

You can find a detailed arcticle about the smart contract on [medium](https://ereynier.medium.com/from-screen-to-walls-unleashing-the-true-potential-of-nfts-9c43b25b57fd)

You can use the testnet website at [https://nft-prints.ereynier.me](https://nft-prints.ereynier.me)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Estéban Reynier - [@EstebanReynier](https://twitter.com/@EstebanReynier) - esteban@ereynier.com

Project Link: [https://github.com/ereynier/NFT-PhotoPrint](https://github.com/ereynier/NFT-PhotoPrint)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Foundry](https://book.getfoundry.sh/)
* [OpenZeppelin](https://docs.openzeppelin.com/)
* [Wagmi.sh](https://wagmi.sh/)
* [Viem.sh](https://viem.sh/)
* [Creativehub](https://www.creativehub.io/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ereynier/NFT-PhotoPrint.svg?style=for-the-badge
[contributors-url]: https://github.com/ereynier/NFT-PhotoPrint/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ereynier/NFT-PhotoPrint.svg?style=for-the-badge
[forks-url]: https://github.com/ereynier/NFT-PhotoPrint/network/members
[stars-shield]: https://img.shields.io/github/stars/ereynier/NFT-PhotoPrint.svg?style=for-the-badge
[stars-url]: https://github.com/ereynier/NFT-PhotoPrint/stargazers
[issues-shield]: https://img.shields.io/github/issues/ereynier/NFT-PhotoPrint.svg?style=for-the-badge
[issues-url]: https://github.com/ereynier/NFT-PhotoPrint/issues
[license-shield]: https://img.shields.io/github/license/ereynier/NFT-PhotoPrint.svg?style=for-the-badge
[license-url]: https://github.com/ereynier/NFT-PhotoPrint/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/ereynier
[product-screenshot]: images/gallery.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Solidity]: https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white
[Solidity-url]: https://docs.soliditylang.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Foundry]: https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white
[Foundry-url]: https://book.getfoundry.sh/