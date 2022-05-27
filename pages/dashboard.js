import { ethers } from "ethers";
import { useEffect, useState } from "react";
import NFTabi from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import Loader from "./Loader";
const NFTcontractdeployAddress = "0x62bB52eaE35c3Dab0250b54764E67DfF86B9c5F8";

const CreatorDashboard = () => {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNfts = async () => {
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

        const data = await contract.fetchItemsListed.call(function (
          err,
          res
        ) {});
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

            // setNfts(...nfts, item)
            return item;
          })
        );

        const soldItems = items.filter((i) => i.sold);
        setSold(soldItems);
        setNfts(items);
        setIsLoading(false);
      } catch (error) {
        alert("Something Went Wrong!!", error);
        console.log("Error uploading file: ", error);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNfts();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="p-4">
            <h2 className="text-2xl py-2">NFT Listed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="rounded" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorDashboard;
