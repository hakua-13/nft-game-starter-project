const CONTRACT_ADDRESS = '0x14A3556016aBBE6C814258C0C7Ce4d6E189a56EC';

const transformCharacterData = (characterData) => {
  return{
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData };