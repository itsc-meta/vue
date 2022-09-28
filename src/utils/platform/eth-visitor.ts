// import Web3 from 'web3/dist/web3.min.js';
import {ethers} from 'ethers';
// import Web3 from 'web3';
import axios from 'axios';
// import {contract} from './contract.js';
// const contract = import.meta.glob("@truffle/contract", { import: 'setup', eager: true });
// const contract = require("@truffle/contract");

export class EthVisitor {
  // block chain
  web3Provider:any = null;
  contracts:any = {};

  constructor() {
    this.init();
  }
  init = async() => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    console.log(signer);
    const network = await provider.getNetwork();
    console.log(network);
    const tokenJson = await import('@/contracts/Visitor.json');
    console.log(tokenJson);
    // const contract = new ethers.Contract(
    //   network.name,
    //   tokenJson,
    //   provider
    // )
  }
  contract = async() => {
    axios.get('contracts/visitor.json').then(({data}) => {
      // console.log(data, contract);      
      // this.contracts.visitor = contract(data);
      // this.contracts.visitor.setProvider(this.web3Provider);
      console.log(this.contracts);
    });
  }
}
