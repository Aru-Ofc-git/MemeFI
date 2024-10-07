
function getTgWebAppData(url) {
    // Extract the part after # (the fragment containing the query parameters)
    const fragment = url.split("#")[1];

    // Check if there is a fragment with query parameters
    if (fragment) {
        // Split the fragment by '&' to get individual key-value pairs
        const params = fragment.split("&");

        // Initialize an object to hold the decoded tgWebAppData
        let tgWebAppData = {};

        // Iterate over each parameter
        params.forEach(param => {
            // Split by '=' to get the key and value
            const [key, value] = param.split("=");

            // Decode the key and value
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value);

            // Check if the key is 'tgWebAppData'
            if (decodedKey === "tgWebAppData") {
                // Split the value into individual key-value pairs
                const dataPairs = decodedValue.split("&");

                // Iterate through the key-value pairs
                dataPairs.forEach(pair => {
                    const [dataKey, dataValue] = pair.split("=");
                    // Decode and store in the tgWebAppData object
                    tgWebAppData[decodeURIComponent(dataKey)] =
                        decodeURIComponent(dataValue);
                });
            }
        });

        return tgWebAppData;
    }

    return null;
}

var token = "";
var nonceToken = "";
var currentHealth = "";
var currentTurboAmount = "";
var currentRefillEnergyAmount = "";
var coin = "";
async function userData(token) {
    const url = "https://api-gw-tg.memefi.club/graphql";
    var dataUser = JSON.stringify([
        {
            operationName: "QueryTelegramUserMe",
            variables: {},
            query: "query QueryTelegramUserMe {\n  telegramUserMe {\n    firstName\n    lastName\n    telegramId\n    username\n    referralCode\n    isDailyRewardClaimed\n    referral {\n      username\n      lastName\n      firstName\n      bossLevel\n      coinsAmount\n      __typename\n    }\n    isReferralInitialJoinBonusAvailable\n    league\n    leagueIsOverTop10k\n    leaguePosition\n    _id\n    opens {\n      isAvailable\n      openType\n      __typename\n    }\n    features\n    role\n    earlyAdopterBonusAmount\n    earlyAdopterBonusPercentage\n    isFreeDurovDonated\n    hasPremiumSubscription\n    binanceTask {\n      binanceId\n      status\n      completionRewardCoins\n      validationRewardCoins\n      __typename\n    }\n    __typename\n  }\n}"
        }
    ]);

    const resUser = await fetch(url, {
        method: "POST",
        headers: {
            authorization: "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: dataUser
    });

    const userData = await resUser.json();
    return userData;
}
async function nonce(token) {
    const url = "https://api-gw-tg.memefi.club/graphql";
    var nonceToken = JSON.stringify([
        {
            operationName: "QUERY_GAME_CONFIG",
            variables: {},
            query: "query QUERY_GAME_CONFIG {\n  telegramGameGetConfig {\n    ...FragmentBossFightConfig\n    __typename\n  }\n}\n\nfragment FragmentBossFightConfig on TelegramGameConfigOutput {\n  _id\n  coinsAmount\n  currentEnergy\n  maxEnergy\n  weaponLevel\n  zonesCount\n  tapsReward\n  energyLimitLevel\n  energyRechargeLevel\n  tapBotLevel\n  currentBoss {\n    _id\n    level\n    currentHealth\n    maxHealth\n    __typename\n  }\n  freeBoosts {\n    _id\n    currentTurboAmount\n    maxTurboAmount\n    turboLastActivatedAt\n    turboAmountLastRechargeDate\n    currentRefillEnergyAmount\n    maxRefillEnergyAmount\n    refillEnergyLastActivatedAt\n    refillEnergyAmountLastRechargeDate\n    __typename\n  }\n  bonusLeaderDamageEndAt\n  bonusLeaderDamageStartAt\n  bonusLeaderDamageMultiplier\n  nonce\n  spinEnergyNextRechargeAt\n  spinEnergyNonRefillable\n  spinEnergyRefillable\n  spinEnergyTotal\n  spinEnergyStaticLimit\n  __typename\n}"
        }
    ]);

    const resUser = await fetch(url, {
        method: "POST",
        headers: {
            authorization: "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: nonceToken
    });

    const userData = await resUser.json();
    return userData;
}

document.querySelector(".check-btn").addEventListener("click", async () => {
    var url = document.querySelector(".input-box").value;
    if (url) {
        var data = getTgWebAppData(url);
        if (data != null) {
            const user = JSON.parse(data["user"]);

            const url = "https://api-gw-tg.memefi.club/graphql";

            const dataToken = JSON.stringify([
                {
                    operationName: "MutationTelegramUserLogin",
                    variables: {
                        webAppData: {
                            auth_date: parseInt(data["auth_date"]),
                            hash: data["hash"],
                            query_id: data["query_id"],
                            checkDataString:
                                "auth_date=" +
                                data["auth_date"] +
                                "\nquery_id=" +
                                data["query_id"] +
                                '\nuser={"id":' +
                                user["id"] +
                                ',"first_name":"' +
                                user["first_name"] +
                                '","last_name":"' +
                                user["last_name"] +
                                '","username":"' +
                                user["username"] +
                                '","language_code":"en","allows_write_to_pm":true}',
                            user: {
                                id: user["id"],
                                allows_write_to_pm: true,
                                first_name: user["first_name"],
                                last_name: user["last_name"],
                                username: user["username"],
                                language_code: "en",
                                version: "7.8",
                                platform: "android"
                            }
                        }
                    },
                    query: "mutation MutationTelegramUserLogin($webAppData: TelegramWebAppDataInput!, $referralCode: String) {\n  telegramUserLogin(webAppData: $webAppData, referralCode: $referralCode) {\n    access_token\n    __typename\n  }\n}"
                }
            ]);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: dataToken
            });

            const text = await response.text();
            console.log(text);
            const resData = JSON.parse(text);
            if (resData[0]["data"]["telegramUserLogin"]["access_token"]) {
                token = resData[0]["data"]["telegramUserLogin"]["access_token"];
                var userInfo = await userData(token);
                var gameInfo = await nonce(token);
                if (userInfo && gameInfo) {
                    // document.getElementById("name").innerText = userInfo[0]["telegramUserMe"]
                    var name =
                        userInfo[0]["data"]["telegramUserMe"]["firstName"] +
                        " " +
                        userInfo[0]["data"]["telegramUserMe"]["lastName"];
                    document.getElementById("name").innerText = name;
                    document.getElementById("username").innerText =
                        userInfo[0]["data"]["telegramUserMe"]["username"];
                    document.getElementById("level").innerText =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "currentBoss"
                        ]["level"];
                    totalHealth =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "currentBoss"
                        ]["maxHealth"];
                    document.getElementById("total-coins").innerText =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "coinsAmount"
                        ];
                    coin =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "coinsAmount"
                        ];
                    currentTurboAmount =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "freeBoosts"
                        ]["currentTurboAmount"];
                    document.getElementById("turbo").innerText =
                        currentTurboAmount +
                        " | " +
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "freeBoosts"
                        ]["maxTurboAmount"];
                    currentRefillEnergyAmount =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "freeBoosts"
                        ]["currentRefillEnergyAmount"];
                    document.getElementById("rcj").innerText =
                        currentRefillEnergyAmount +
                        " | " +
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "freeBoosts"
                        ]["maxRefillEnergyAmount"];
                    document.getElementById("energy").innerText =
                        gameInfo[0]["data"]["telegramGameGetConfig"][
                            "currentEnergy"
                        ];
                    document.getElementById("refname").innerText =
                        userInfo[0]["data"]["telegramUserMe"]["referral"][
                            "firstName"
                        ] +
                        " " +
                        userInfo[0]["data"]["telegramUserMe"]["referral"][
                            "lastName"
                        ];
                    document.querySelector(".contents").style.display = "block";
                    document.querySelector(".input-group").style.display =
                        "none";

                    nonceToken =
                        gameInfo[0]["data"]["telegramGameGetConfig"]["nonce"];
                }
            }
        }
    } else {
        alert("Please Give URL");
    }
});

async function clickAuto(token, nonce) {
    const url = "https://api-gw-tg.memefi.club/graphql";

    const data = JSON.stringify([
        {
            operationName: "MutationGameProcessTapsBatch",
            variables: {
                payload: {
                    nonce: nonce,
                    tapsCount: totalHealth,
                    vector: "3,3,3,3"
                }
            },
            query: "mutation MutationGameProcessTapsBatch($payload: TelegramGameTapsBatchInput!) {\n  telegramGameProcessTapsBatch(payload: $payload) {\n    ...FragmentBossFightConfig\n    __typename\n  }\n}\n\nfragment FragmentBossFightConfig on TelegramGameConfigOutput {\n  _id\n  coinsAmount\n  currentEnergy\n  maxEnergy\n  weaponLevel\n  zonesCount\n  tapsReward\n  energyLimitLevel\n  energyRechargeLevel\n  tapBotLevel\n  currentBoss {\n    _id\n    level\n    currentHealth\n    maxHealth\n    __typename\n  }\n  freeBoosts {\n    _id\n    currentTurboAmount\n    maxTurboAmount\n    turboLastActivatedAt\n    turboAmountLastRechargeDate\n    currentRefillEnergyAmount\n    maxRefillEnergyAmount\n    refillEnergyLastActivatedAt\n    refillEnergyAmountLastRechargeDate\n    __typename\n  }\n  bonusLeaderDamageEndAt\n  bonusLeaderDamageStartAt\n  bonusLeaderDamageMultiplier\n  nonce\n  spinEnergyNextRechargeAt\n  spinEnergyNonRefillable\n  spinEnergyRefillable\n  spinEnergyTotal\n  spinEnergyStaticLimit\n  __typename\n}"
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
    const dataRes = JSON.parse(text);
    currentHealth =
        dataRes[0]["data"]["telegramGameProcessTapsBatch"]["currentBoss"][
            "currentHealth"
        ];

    document.querySelector(".output").style.display = "block";
    document.querySelector(".rotating-squares").style.visibility = "visible";
    document.querySelector(".output").innerText += text;
    document.getElementById("energy").innerText =
        dataRes[0]["data"]["telegramGameProcessTapsBatch"]["currentEnergy"];
    document.querySelector(".up").innerText =
        document.getElementById("total-coins").innerText +
        " ▶️ " +
        dataRes[0]["data"]["telegramGameProcessTapsBatch"]["coinsAmount"];
    document.getElementById("total-coins").innerText =
        dataRes[0]["data"]["telegramGameProcessTapsBatch"]["coinsAmount"];

    document.getElementById("level").innerText =
        dataRes[0]["data"]["telegramGameProcessTapsBatch"]["currentBoss"][
            "level"
        ];
}

function loop() {
    for (let i = 1; i <= 3; i++) {
        if (currentHealth == 0) {
                var level = levelUp(token);
                console.log(level);
            }

            clickAuto(token, nonceToken);
        setTimeout(() => {
            console.log("wait 2.5s")
        },2500); // 3000 ms = 3 seconds
    }
    var st = document.querySelector(".start-btn");
    st.disabled = false;
    document.querySelector(".output").style.display = "none";
    document.querySelector(".message").style.display = "none";
    document.querySelector(".rotating-squares").style.visibility = "hidden";
    
}

document
    .querySelector(".start-btn")
    .addEventListener("click", async function () {
        if (currentTurboAmount != 0) {
            if (document.getElementById("energy").innerText < 100) {
                if (currentRefillEnergyAmount != 0) {
                    document.querySelector(".up").innerText =
                        "Activateing Recharge Booster";
                    var activateRcj = await activateRechargeBoster(token);

                    if (activateRcj) {
                        document.querySelector(".up").innerText =
                            " Recharge Booster Activated";
                        setTimeout(() => {
                            console.log("wait");
                        }, 2000);
                        document.querySelector(".up").innerText =
                            "Activateing Turbo Booster.";
                        var act = await activateBoster(token);
                        if (act) {
                            document.querySelector(".up").innerText =
                                "Turbo Booster Activated.";
                            var st = document.querySelector(".start-btn");
                            st.disabled = true;
                            loop();
                        } else {
                            document.querySelector(".up").innerText =
                                "Turbo Booster Activation Failed.";
                        }
                    }
                } else {
                    document.querySelector(".up").innerText =
                        "Please Spin and Gain Recharge Booster.";
                }
            } else {
                document.querySelector(".up").innerText =
                    "Activateing Turbo Booster.";
                var act = await activateBoster(token);
                if (act) {
                    document.querySelector(".up").innerText =
                        "Turbo Booster Activated.";
                    var st = document.querySelector(".start-btn");
                    st.disabled = true;
                    loop();
                } else {
                    document.querySelector(".up").innerText =
                        "Turbo Booster Activation Failed.";
                }
            }
        } else {
            document.querySelector(".up").innerText =
                "Please Spin And Earn Turbo Booster.";
        }
    });
