@echo off
echo 🛠️  SUI Wallet Faucet Bypass Helper
echo.

:menu
echo Choose an option:
echo 1. Create new wallet for faucet bypass
echo 2. List all wallets
echo 3. Switch to faucet-bypass wallet
echo 4. Switch back to main wallet (elated-topaz)
echo 5. Transfer SUI from current wallet to main
echo 6. Check current wallet balance
echo 7. Get Discord faucet link
echo 0. Exit
echo.

set /p choice="Enter your choice (0-7): "

if "%choice%"=="1" goto create_wallet
if "%choice%"=="2" goto list_wallets
if "%choice%"=="3" goto switch_to_bypass
if "%choice%"=="4" goto switch_to_main
if "%choice%"=="5" goto transfer_sui
if "%choice%"=="6" goto check_balance
if "%choice%"=="7" goto discord_link
if "%choice%"=="0" goto exit
goto menu

:create_wallet
echo 🔧 Creating new wallet...
set /p alias="Enter alias for new wallet (or press Enter for auto-generated): "
if "%alias%"=="" (
    node wallet-manager.js create-wallet
) else (
    node wallet-manager.js create-wallet %alias%
)
pause
goto menu

:list_wallets
echo 📋 Listing all wallets...
node wallet-manager.js list-wallets
pause
goto menu

:switch_to_bypass
echo 🔄 Switching to faucet-bypass wallet...
sui client switch --address faucet-bypass
echo ✅ Switched to faucet-bypass wallet!
pause
goto menu

:switch_to_main
echo 🔄 Switching to main wallet...
sui client switch --address elated-topaz
echo ✅ Switched to main wallet!
pause
goto menu

:transfer_sui
echo 💸 Starting transfer process...
echo Current active address:
sui client active-address
echo.
echo Available gas coins:
sui client gas
echo.
echo Transfer to main wallet: 0xc2bee94fa7431a3e721c995734b00f15b24155fa2d14f6c49eb5fda3003cf7cd
echo.
set /p coin_id="Enter the coin object ID to transfer: "
if not "%coin_id%"=="" (
    sui client transfer-sui --to 0xc2bee94fa7431a3e721c995734b00f15b24155fa2d14f6c49eb5fda3003cf7cd --sui-coin-object-id %coin_id% --gas-budget 1000000
    echo ✅ Transfer completed!
) else (
    echo ❌ No coin ID provided!
)
pause
goto menu

:check_balance
echo 💰 Current wallet balance:
sui client active-address
sui client gas
pause
goto menu

:discord_link
echo 🎯 Getting Discord faucet link...
echo Current active address:
sui client active-address
echo.
echo Join Sui Discord: https://discord.gg/sui
echo Go to #testnet-faucet channel
echo Type: !faucet [your address from above]
pause
goto menu

:exit
echo 👋 Goodbye!
pause
exit
