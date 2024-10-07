var totalHealth = "";
async function levelUp(token) {
    const url = "https://api-gw-tg.memefi.club/graphql";

    const data = JSON.stringify([
        {
            operationName: "telegramGameSetNextBoss",
            variables: {},
            query: "mutation telegramGameSetNextBoss {\n  telegramGameSetNextBoss {\n    ...FragmentBossFightConfig\n    __typename\n  }\n}\n\nfragment FragmentBossFightConfig on TelegramGameConfigOutput {\n  _id\n  coinsAmount\n  currentEnergy\n  maxEnergy\n  weaponLevel\n  zonesCount\n  tapsReward\n  energyLimitLevel\n  energyRechargeLevel\n  tapBotLevel\n  currentBoss {\n    _id\n    level\n    currentHealth\n    maxHealth\n    __typename\n  }\n  freeBoosts {\n    _id\n    currentTurboAmount\n    maxTurboAmount\n    turboLastActivatedAt\n    turboAmountLastRechargeDate\n    currentRefillEnergyAmount\n    maxRefillEnergyAmount\n    refillEnergyLastActivatedAt\n    refillEnergyAmountLastRechargeDate\n    __typename\n  }\n  bonusLeaderDamageEndAt\n  bonusLeaderDamageStartAt\n  bonusLeaderDamageMultiplier\n  nonce\n  spinEnergyNextRechargeAt\n  spinEnergyNonRefillable\n  spinEnergyRefillable\n  spinEnergyTotal\n  spinEnergyStaticLimit\n  __typename\n}"
        }
    ]);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            authorization: "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: data
    });

    const text = await response.text();
    console.log(text);
    const dataRes = JSON.parse(text);
    if (dataRes[0]["data"]["telegramGameSetNextBoss"]) {
        totalHealth =
            dataRes[0]["data"]["telegramGameSetNextBoss"]["currentBoss"][
                "maxHealth"
            ];
        document.getElementById("level").innerText =
            dataRes[0]["data"]["telegramGameSetNextBoss"]["currentBoss"][
                "level"
            ];
        document.getElementById("total-coins").innerText =
            dataRes[0]["data"]["telegramGameSetNextBoss"]["coinsAmount"];
        document.getElementById("energy").innerText =
            dataRes[0]["data"]["telegramGameSetNextBoss"]["currentEnergy"];
        return true;
    } else {
        return false;
    }
}
