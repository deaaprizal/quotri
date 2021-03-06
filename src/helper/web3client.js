import Web3 from "web3";
import QuotriContract from "contracts/Quotri.json";

const Contract = require("web3-eth-contract");
let web3 = new Web3(window.ethereum);

let current_account;
let initial = false;
let provider = window.ethereum;

export const init = async () => {
  if (typeof provider !== "undefined") {
    //set current account
    provider
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        current_account = accounts[0];
      })
      .catch((err) => {
        if (err.code == -32002) {
          localStorage.removeItem("address");
          window.location.reload();
        }
        return;
      });

    //change to other account
    provider.on("accountsChanged", (new_accounts) => {
      current_account = new_accounts;
      window.location.reload();
      console.log("changed account to ", new_accounts);
    });
  }

  //set provider
  web3 = new Web3(provider);

  //initialize finish
  initial = true;
  if (!initial) {
    await init();
  }
  return web3;
};

export const getAccount = async (block) => {
  const account = block.eth.getAccounts(function (error, result) {
    if (!error) return result[0];
  });

  return account;
};

export const getBalance = async (address, block) => {
  const balance = block.eth.getBalance(address, function (error, result) {
    if (!error) return result;
  });
  return balance;
};

export const getQuoteById = async (id) => {
  init();
  console.log("connected to quotri contract ");

  Contract.setProvider(provider);

  const contract = new Contract(
    QuotriContract.abi,
    QuotriContract.networks[5777].address
  );

  return contract.methods.quotes(id).call();
};

export const createNewQuote = async (address, content) => {
  init();
  console.log("ready for add quotes");

  Contract.setProvider(provider);

  const contract = new Contract(
    QuotriContract.abi,
    QuotriContract.networks[5777].address
  );

  return contract.methods
    .createQuote(content)
    .send({ from: address })
    .on("receipt", function () {
      console.log("kutipan berhasil ditambahkan");
    });
};

export const getDapp = async (setAddress) => {
  provider
    .request({ method: "eth_requestAccounts" })
    .then((accounts) => {
      setAddress(accounts[0]);
      localStorage.setItem("address", accounts[0]);
      console.log("accounts[0] =>", accounts[0])
    })
    .catch((err) => {
      if (err.code == -32002) {
        localStorage.removeItem("address");
        window.location.reload();
      }
      return;
    });

  provider.on("accountsChanged", (new_accounts) => {
    setAddress(new_accounts[0]);
    localStorage.setItem("address", new_accounts[0]);
    console.log("changed account to new_accounts[0]", new_accounts[0]);
  });
};
