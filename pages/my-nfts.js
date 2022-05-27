import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Loader from "./Loader";
import NFTabi from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const NFTcontractdeployAddress = "0x62bB52eaE35c3Dab0250b54764E67DfF86B9c5F8";

const MyAssest = () => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const routerHistory = useRouter();

  const getAllUnsoldNfts = async () => {
    if (window.ethereum) {
      setIsLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          NFTcontractdeployAddress,
          NFTabi.abi,
          signer
        );

        // const data = await contract.fetchMarketItems()
        const data = await contract.fetchMyNFTs.call(function (err, res) {});
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
              tokenURI: tokenUri,
            };
            console.log(item);
            // setNfts(...nfts, item)
            return item;
          })
        );
        setNfts(items);
        setIsLoading(false);
      } catch (error) {
        alert("Something Went Wrong!!", error);
        console.log("Error uploading file: ", error);
        setIsLoading(false);
      }
    }
  };

  function listNFT(nft) {
    console.log("nft:", nft);
    routerHistory.push(
      `/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`
    );
  }

  useEffect(() => {
    getAllUnsoldNfts();
  }, []);

  return (
    <>
      <div>
        {isLoading ? (
          <Loader />
        ) : !nfts.length ? (
          "Yeu have No NFT Purchase Yet"
        ) : (
          <div className="flex justify-center">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {nfts.map((nft, i) => (
                  <div
                    key={i}
                    className="border shadow rounded-xl overflow-hidden"
                  >
                    <img src={nft.image} className="rounded" />
                    <div className="p-4 bg-gray-300">
                      <p className="text-2xl font-bold text-white">
                        Price - {nft.price} Eth
                      </p>
                      <button
                        className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-12 rounded"
                        onClick={() => listNFT(nft)}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyAssest;
