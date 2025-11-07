import React, { createContext, useContext, useState } from 'react';

const AssetDataContext = createContext();

export const useAssetData = () => useContext(AssetDataContext);

export const AssetDataProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([]);

  return (
    <AssetDataContext.Provider value={{ csvData, setCsvData }}>
      {children}
    </AssetDataContext.Provider>
  );
};






