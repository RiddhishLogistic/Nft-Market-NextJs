import "../styles/globals.css";
import { useState } from "react";
import Connect from "./Connect";
import Navbar from "./Navbar";

function MyApp({ Component, pageProps }) {
  const [isWalletConnected, setisWalletConnected] = useState(false);

  return (
    <>
      {!isWalletConnected ? (
        <Connect setisWalletConnected={setisWalletConnected} />
      ) : (
        <>
          <Navbar />
          <Component {...pageProps} />
        </>
      )}
    </>
  );
}

export default MyApp;
