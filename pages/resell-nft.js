import { ethers } from "ethers";
import { useEffect, useState } from "react";
import NFTabi from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "./Loader";
const NFTcontractdeployAddress = "0x62bB52eaE35c3Dab0250b54764E67DfF86B9c5F8";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  let search = window.location.search;
  let params = new URLSearchParams(search);
  let id = params.get("id");
  let tokenURI = params.get("tokenURI");
  const { image, price } = formInput;
  const routerBrowser = useRouter();

  const [isLoading, setisLoading] = useState(false);

  async function fetchNFT() {
    if (!tokenURI) return;
    setisLoading(true);
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({ ...state, image: meta.data.image }));
    setisLoading(false);
  }

  async function listNFTForSale() {
    try {
      if (!price) return;
      setisLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        NFTcontractdeployAddress,
        NFTabi.abi,
        signer
      );

      let listingPrice = await contract.getListingPrice();
      const priceFormatted = ethers.utils.parseUnits(formInput.price, "ether");
      listingPrice = listingPrice.toString();
      let transaction = await contract.resellToken(id, priceFormatted, {
        value: listingPrice,
      });
      await transaction.wait();
      setisLoading(false);
      routerBrowser.push("/");
    } catch (error) {
      alert(`
                "Status":"${error.code}",
                "Argument":${error.message}

            `);
      setisLoading(false);
    }
  }
  useEffect(() => {
    fetchNFT();
  }, [id]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex justify-center">
          <div className="w-1/2 flex flex-col pb-12">
            <input
              placeholder="Asset Price in Eth"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            {image && <img className="rounded mt-4" width="100%" src={image} />}
            <button
              onClick={listNFTForSale}
              className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg"
            >
              List NFT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
