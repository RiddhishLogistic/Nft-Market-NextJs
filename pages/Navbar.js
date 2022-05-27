import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div>
      <nav className="border-b p-6 flex justify-center">
        <p className="text-4xl font-bold mr-10">NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-green-500">Home</a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-green-500">Sell NFT</a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-green-500">My NFTs</a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-green-500">Dashboard</a>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
