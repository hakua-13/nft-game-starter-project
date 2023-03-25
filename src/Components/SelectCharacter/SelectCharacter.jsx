import { useEffect, useState } from "react";
import { ethers } from 'ethers';

import './SelectCharacter.css'
import myEpicGame from '../../utils/MyEpicGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';

import LoadingIndicator from "../LoadingIndicator";

export const SelectCharacter = ({ setCharacterNFT }) => {
  const [ characters, setCharacters ] = useState([]);
  // コントラクトのデータを保有する状態変数
  const [ gameContract, setGameContract ] = useState(null);
  // Mintingの状態を保存する状態変数
  const [ mintingCharacter, setMintingCharacter ] = useState(false);

  const mintCharacterNFTAction = async(characterId) => {
    try{
      if(gameContract){
        console.log('Minting character in progress...');
        setMintingCharacter(true);
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();

        console.log('mintTxn:', mintTxn);
      }
    }catch(error){
      console.log('MintingCharacterAction Error: ', error);
    }
    setMintingCharacter(false);
  }

  useEffect(() => {
    const { ethereum } = window;
    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    }else{
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try{
        console.log('Getting contract characters to mint');
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn: ', charactersTxn);
        const characters = charactersTxn.map((character) => {
          return transformCharacterData(character)
        })
        setCharacters(characters);
      }catch(error){
        console.log(error)
      }
    };

    const onCharacterMint = async(sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender}, tokenId: ${tokenId.toNumber()}, characterIndex: ${characterIndex.toNumber()}`
      );

      if(gameContract){
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    }
    
    if(gameContract){
      getCharacters();
      // nftがmintされたときのイベントを受け取る
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return() => {
      if(gameContract){
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

  const renderCharacters = () => (
    characters.map((character, index) => (
      <div className='character-item' key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name}/>
        <button
          type='button'
          className='character-mint-button'
          onClick={() => mintCharacterNFTAction(index)}
        >
          {`Mint ${character.name}`}
        </button>
      </div>
    ))
  )

  return(
    <div className="select-character-container">
      <h2>⏬ 一緒に戦うNFTキャラクターを選択 ⏬</h2>
      {characters.length>0 && (
        <div className='character-grid'>{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator/>
            <p>Minting In Progress...</p>
          </div>
        </div>
      )}
    </div>
  );
};