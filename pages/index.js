import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Loader from "./Loader";
import NFTabi from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
const NFTcontractdeployAddress = "0x62bB52eaE35c3Dab0250b54764E67DfF86B9c5F8";
import axios from "axios";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAllUnsoldNfts = async () => {
    console.log("run1");
    if (window.ethereum) {
      console.log("run2");

      setIsLoading(true);
      try {
        // const provider = new ethers.providers.JsonRpcProvider();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          NFTcontractdeployAddress,
          NFTabi.abi,
          signer
        );

        // const data = await contract.fetchMarketItems()
        const data = await contract.fetchMarketItems.call(function (
          err,
          res
        ) {});
        console.log(data);
        const items = await Promise.all(
          data.map(async (i) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri); //https://ifs...id
            let price = ethers.utils.formatUnits(i.price.toString(), "ether");

            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description,
            };

            setNfts(...nfts, item);
            return item;
          })
        );
        setNfts(items);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log("error:", error);
      }
    } else {
      alert("Please install Meta mask");
    }
  };

  async function buyNft(nft) {
    try {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        NFTcontractdeployAddress,
        NFTabi.abi,
        signer
      );

      /* user will be prompted to pay the asking proces to complete the transaction */
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();
      getAllUnsoldNfts();
      setIsLoading(false);
    } catch (error) {
      alert(`
                "Status":"${error.code}",
                "Argument":${error.message}
                `);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllUnsoldNfts();
  }, []);

  return (
    <div className={styles.container}>
      <>
        {isLoading ? (
          <Loader />
        ) : !nfts.length ? (
          "No NFT Present in Store"
        ) : (
          <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: "1600px" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {nfts.map((nft, i) => (
                  <div
                    key={i}
                    className="border shadow rounded-xl overflow-hidden"
                    id="imageId"
                  >
                    <img src={nft.image} />
                    <div className="p-4">
                      <p
                        style={{ height: "64px" }}
                        className="text-2xl font-semibold"
                      >
                        {nft.name}
                      </p>
                      <div style={{ height: "70px", overflow: "hidden" }}>
                        <p className="text-gray-400">{nft.description}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-400">
                      <p className="text-2xl font-bold text-white">
                        Price : {nft.price} ETH{" "}
                      </p>
                      <button
                        className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-12 rounded"
                        onClick={() => buyNft(nft)}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
