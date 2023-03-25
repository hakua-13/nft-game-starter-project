import { useEffect, useState } from "react";
import { ethers } from 'ethers';

import './Arena.css';
import myEpicGame from '../../utils/MyEpicGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';

import LoadingIndicator from "../LoadingIndicator";

export const Arena = ({characterNFT, setCharacterNFT}) => {
  const [gameContract, setGameContract] = useState(null);
  const [ boss, setBoss ] = useState(null);
  const [ attackState, setAttackState ] = useState('');
  const [ showToast, setShowToast] = useState(false);

  // ボスを攻撃する関数
  const runAttackAction = async() => {
    try{
      if(gameContract){
        setAttackState('attaking');
        console.log('attaking boss...')

        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn: ', attackTxn);

        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    }catch(error){
      console.log('error attaking boss: ', error);
      setAttackState('');
    }
  };

  
  useEffect(() => {
    const fetchBoss = async() => {
      const bossTxn = await gameContract.getBigBoss();
      setBoss(transformCharacterData(bossTxn));
    }

    // attackしたときのeventを受け取る
    const onAttackComplete = (bossHp, playerHp) => {
      console.log('bossHp: ', bossHp);
      console.log('playerHp: ', playerHp);
  
      setBoss(prevState => ({...prevState, hp: bossHp.toNumber()}));
      setCharacterNFT(prevState => ({...prevState, hp: playerHp.toNumber()}));
    }

    if(gameContract){
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

    // マウント、アンマウント時に returnが実行されている
    return() => {
      if(gameContract){
        console.log('マウントされた');
        gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract])

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

  return(
    <div className="arena-container">
      {/* 攻撃ダメージの通知 */}
      {boss&& characterNFT && (
        <div id="toast" className={showToast ? 'show' : ''}>
          <div id="desc">
            {`${boss.name} was hit for ${characterNFT.attackDamage}!`}
          </div>
        </div>
      )}

      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name } 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp}/>
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>

          {attackState === 'attacking' && (
            <div className="loading-indicator">
              <LoadingIndicator/>
              <p>Attaking ⚔️</p>
            </div>
          )}
        </div>
      )}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img src={characterNFT.imageURI} alt={`Character ${characterNFT.name}`} />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp}/>
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className='stats'>
                <h4>
                  {`🗡 Attack Damage: ${characterNFT.attackDamage}`}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}