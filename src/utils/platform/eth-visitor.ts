import Web3 from 'web3';
import axios from 'axios';
// import {contract} from './contract.js';
// const contract = import.meta.glob("@truffle/contract", { import: 'setup', eager: true });
// const contract = require("@truffle/contract");


export class EthVisitor {
  // block chain
  web3Provider:any = null;
  contracts:any = {};

  constructor() {

  }
  init = async() => {
    if (window.ethereum) {// Modern dapp browsers...
      this.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    } else if (window.web3) { // Legacy dapp browsers...
      this.web3Provider = window.web3.currentProvider;
    } else { // If no injected web3 instance is detected, fall back to Ganache
      // this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    // const web3 = new Web3(this.web3Provider);

    this.contract();
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
