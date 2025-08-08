#!/usr/bin/env node

/**
 * Wallet Manager for Testnet SUI Faucet Bypass
 * 
 * This script helps you manage multiple wallet addresses to bypass faucet limits
 * 
 * Usage:
 * node wallet-manager.js create-wallet [alias]
 * node wallet-manager.js list-wallets
 * node wallet-manager.js switch-wallet [alias]
 * node wallet-manager.js transfer-all-to-main
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function runSuiCommand(command) {
  try {
    const result = execSync(`sui ${command}`, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    console.error(`Error running sui command: ${error.message}`);
    return null;
  }
}

function createNewWallet(alias) {
  const walletAlias = alias || `wallet-${Date.now()}`;
  console.log(`🔧 Creating new wallet: ${walletAlias}`);
  
  const result = runSuiCommand(`client new-address ed25519 ${walletAlias}`);
  if (result) {
    console.log('✅ New wallet created successfully!');
    console.log(result);
    
    // Extract the address from the output
    const addressMatch = result.match(/address\s+│\s+(0x[a-fA-F0-9]+)/);
    if (addressMatch) {
      const newAddress = addressMatch[1];
      console.log(`\n🪙 Request testnet SUI for this address:`);
      console.log(`https://faucet.sui.io/?address=${newAddress}`);
      console.log(`\nOr use Discord: !faucet ${newAddress}`);
    }
  }
}

function listWallets() {
  console.log('📋 Available wallets:');
  const result = runSuiCommand('client addresses');
  if (result) {
    console.log(result);
  }
}

function switchWallet(alias) {
  console.log(`🔄 Switching to wallet: ${alias}`);
  const result = runSuiCommand(`client switch --address ${alias}`);
  if (result) {
    console.log('✅ Switched successfully!');
    console.log(result);
  }
}

async function transferAllToMain() {
  console.log('💸 Starting transfer process...');
  
  // Get current active address (should be the source)
  const activeAddress = runSuiCommand('client active-address');
  console.log(`Current active address: ${activeAddress}`);
  
  // Get main address
  const mainAddress = await question('Enter your main wallet address: ');
  
  if (activeAddress === mainAddress) {
    console.log('❌ Source and destination addresses are the same!');
    return;
  }
  
  // Get gas objects for current address
  console.log('🔍 Finding SUI coins to transfer...');
  const gasObjects = runSuiCommand('client gas');
  
  if (!gasObjects || gasObjects.includes('No gas coins')) {
    console.log('❌ No SUI coins found in current wallet!');
    return;
  }
  
  console.log('Available gas objects:');
  console.log(gasObjects);
  
  // Extract coin object IDs from the output
  const coinMatches = gasObjects.match(/0x[a-fA-F0-9]+/g);
  if (coinMatches && coinMatches.length > 0) {
    // Use the first coin for transfer (keep one for gas)
    const coinToTransfer = coinMatches[0];
    
    console.log(`\n💰 Transferring coin ${coinToTransfer} to ${mainAddress}`);
    
    const transferResult = runSuiCommand(
      `client transfer-sui --to ${mainAddress} --sui-coin-object-id ${coinToTransfer} --gas-budget 1000000`
    );
    
    if (transferResult) {
      console.log('✅ Transfer successful!');
      console.log(transferResult);
    }
  } else {
    console.log('❌ Could not parse coin object IDs!');
  }
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'create-wallet':
      createNewWallet(arg);
      break;
    case 'list-wallets':
      listWallets();
      break;
    case 'switch-wallet':
      if (!arg) {
        console.log('❌ Please provide wallet alias');
        break;
      }
      switchWallet(arg);
      break;
    case 'transfer-all-to-main':
      await transferAllToMain();
      break;
    default:
      console.log(`
🛠️  Wallet Manager for Testnet SUI Faucet Bypass

Available commands:
  create-wallet [alias]     - Create a new wallet address
  list-wallets             - List all available wallets
  switch-wallet [alias]    - Switch to a specific wallet
  transfer-all-to-main     - Transfer SUI from current wallet to main wallet

Examples:
  node wallet-manager.js create-wallet backup1
  node wallet-manager.js list-wallets
  node wallet-manager.js switch-wallet backup1
  node wallet-manager.js transfer-all-to-main
      `);
  }
  
  rl.close();
}

main().catch(console.error);
