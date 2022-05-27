import React from "react";
import { useEffect } from "react";

const Connect = ({ setisWalletConnected }) => {
  const walletConnected = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const obj = {
          status: "Write a message in the text-field above.",
          address: addressArray[0],
        };
        setisWalletConnected(true);
        return obj;
      } catch (err) {
        console.log("ERROR :", err);
      }
    } else {
      alert("DOWNLOAD METAMASK FOR ACCESS THIS WEBSITE");
    }
  };

  useEffect(() => {
    walletConnected();
    console.log("wallet connect...");
  }, []);
  return (
    <center>
      <div className="flax justify-center mt-10">
        <button
          className="font-bold bg-green-500 text-white rounded p-4 shadow-lg mt-10"
          onClick={walletConnected}
        >
          Connect Wallet
        </button>
      </div>
    </center>
  );
};

export default Connect;
