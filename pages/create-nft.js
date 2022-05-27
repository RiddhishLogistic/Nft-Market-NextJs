import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Loader from "./Loader";
import { useRouter } from "next/router";
import NFTabi from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
const NFTcontractdeployAddress = "0x62bB52eaE35c3Dab0250b54764E67DfF86B9c5F8";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const CreateItem = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImageloaded, setisImageLoaded] = useState(false);
  const routerBrowser = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    console.log("imaageFile", file);
    var yourImg = document.getElementById("ImageId");
    if (yourImg && yourImg.style) {
      yourImg.style.height = "100px";
      yourImg.style.width = "200px";
    }
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
      console.log("uurrll : ", url);
    } catch (error) {
      alert("Something Went Wrong!!", error);

      console.log("Error uploading file: ", error);
    }
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */

    console.log(isLoading);
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log("uuuuuu", url);
      return url;
    } catch (error) {
      alert("Something Went Wrong!!", error);
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    setIsLoading(true);
    try {
      console.log("isLoading :", isLoading);
      const url = await uploadToIPFS();
      console.log("url : ", url);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      /* next, create the item */
      const price = ethers.utils.parseUnits(formInput.price, "ether");
      const contract = new ethers.Contract(
        NFTcontractdeployAddress,
        NFTabi.abi,
        signer
      );
      console.log("contract:", contract);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      console.log("listingprice", listingPrice);

      let transaction = await contract.createToken(url, price, {
        value: listingPrice,
      });

      console.log(("transcation", transaction));
      const response = await transaction.wait();
      console.log("Transcation Complete", response);
      setIsLoading(false);
      routerBrowser.push("/");
    } catch (error) {
      alert("Something Went Wrong!!   refer console For More details");
      console.log("Error uploading file: ", error);
      setIsLoading(false);
    }

    // navigate.push("/profile");
  }
  const handleImageLoaded = () => {
    console.log("imagre ;loaded");
    setisImageLoaded(true);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex justify-center">
          <div className="w-1/2 flex flex-col pb-12">
            <input
              placeholder="Asset Name"
              className="mt-8 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <textarea
              placeholder="Asset Description"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />
            <input
              placeholder="Asset Price in Eth"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            <input
              type="file"
              name="Asset"
              className="my-4"
              onChange={onChange}
            />
            {fileUrl && (
              <img
                className="upload-img"
                id="ImageId"
                alt="error occur"
                width="50px"
                src={fileUrl}
                onLoad={handleImageLoaded}
              />
            )}
            <button
              onClick={listNFTForSale}
              className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg"
              disabled={fileUrl && isImageloaded ? false : true}
            >
              {isImageloaded ? "Create NFT" : "Waiting for image url"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateItem;
