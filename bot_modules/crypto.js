const fetch = require("node-fetch");
const INTL = require("intl");
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
class Crypto {
    _baseUrl;
    _coinsData;
    _coinsDataName;
    _coinsDetails;
    _newsApiKey = process.env.NEWS_API;

    constructor() {
        setTimeout(() => {
            //console.log("1111111111111", this._newsApiKey);
            this._baseUrl = "https://api.coingecko.com/api/v3/";
            fetch("https://api.coingecko.com/api/v3/coins/list").then((res) =>
                res
                .json()
                .then((result) => ({
                    data: result,
                }))
                .then((ress) => {
                    this._coinsDetails = ress.data;
                })
            );

            this._coinsData = new Map();
            this._coinsDataName = new Map();
            //console.log(this._coinsDetails);
            setTimeout(() => {
                let count = 0;
                for (let i = 0; i < this._coinsDetails.length; i++) {
                    count++;
                    if (this._coinsData.has(this._coinsDetails[i].symbol)) {
                        let tempArr = this._coinsData.get(this._coinsDetails[i].symbol);
                        tempArr.push(this._coinsDetails[i].id);
                        this._coinsData.set(this._coinsDetails[i].symbol, tempArr);
                    } else {
                        this._coinsData.set(this._coinsDetails[i].symbol, [
                            this._coinsDetails[i].id,
                        ]);
                    }
                }

                for (let i = 0; i < this._coinsDetails.length; i++) {
                    if (
                        this._coinsDataName.has(this._coinsDetails[i].name.toLowerCase())
                    ) {
                        let tempArr = this._coinsDataName.get(this._coinsDetails[i].name);
                        if(tempArr){
                        tempArr.push(this._coinsDetails[i].id);
                        this._coinsDataName.set(
                            this._coinsDetails[i].name.toLowerCase(),
                            tempArr
                        );
                        }
                    } else {
                        this._coinsDataName.set(this._coinsDetails[i].name.toLowerCase(), [
                            this._coinsDetails[i].id,
                        ]);
                    }
                }
            }, 10000);
        }, 25000);
    }
    async getPrices(sock, chatId, msgData, msg) {
        if (msgData.msgText === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }
        let coinName = msgData.msgText.toLowerCase();
        let finalStr = "";
        let flag = 0;
        let ids;
        //  console.log(this._coinsData.get(coinName));
        // console.log(this._coinsDataName);
        if (this._coinsDataName.has(coinName)) {
            ids = this._coinsDataName.get(coinName);
        } else if (this._coinsData.has(coinName)) {
            ids = this._coinsData.get(coinName);
        } else {
            flag = 1;
            sock.sendMessage(chatId, { text: "Wrong Coin Name" }, { quoted: msg });
        }

        if (!flag) {
            for (let i = 0; i < ids.length; i++) {
                let coinData = await fetch(
                    `${this._baseUrl}simple/price/?ids=${ids[i]}&vs_currencies=usd,inr,btc`
                );
                let coinDataJson = await coinData.json();
                //console.log(coinDataJson);

                let coinPricesObj = coinDataJson[ids[i]];
                let usdPrice = new INTL.NumberFormat("hi", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 10,
                }).format(coinPricesObj["usd"]);
                let inrPrice = new INTL.NumberFormat("hi", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 10,
                }).format(coinPricesObj["inr"]);
                let btcPrice = new INTL.NumberFormat("hi", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 10,
                }).format(coinPricesObj["btc"]);
                finalStr =
                    finalStr +
                    `_*${ids[
            i
          ].toUpperCase()}*_ \n\n${coinName.toUpperCase()} USD = $${usdPrice}\n${coinName.toUpperCase()} INR = ₹${inrPrice}\n${coinName.toUpperCase()} BTC = ₿${btcPrice}\n\n`;
            }
            sock.sendMessage(chatId, { text: finalStr }, { quoted: msg });
        }
    }
    async getNews(sock, chatId, msgData) {
        let newsJson;
        if (msgData.msgText != "") {
            const news = await fetch(
                `https://newsapi.org/v2/everything?q=+${msgData.msgText}&apiKey=${this._newsApiKey}&sortBy=relevancy&domains=cointelegraph.com,coindesk.com,u.today,cryptoslate.com&language=en`
            );
            newsJson = await news.json();
            //console.log(newsJson);
        } else {
            const news = await fetch(
                `https://newsapi.org/v2/everything?apiKey=${this._newsApiKey}&sortBy=publishedAt&domains=cointelegraph.com,coindesk.com,u.today,cryptoslate.com&language=en`
            );
            newsJson = await news.json();
            //console.log(newsJson);
        }

        let finalStr =
            "*Crypto News* \n\n​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​";
        //console.log(newsJson["articles"]);
        for (let i = 0; i < Math.min(10, newsJson["articles"].length); i++) {
            finalStr += `📊${newsJson["articles"][i]["description"]}\n\n`;
        }
        await sock.sendMessage(chatId, { text: finalStr });
    }
    async getStockPrice(sock, chatId, msgData, msg) {
        if (msgData.msgText === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }
        const url = `https://www.google.com/finance/quote/${msgData.msgText}:NSE`;
        try {
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);

            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);
            let finalString = "";
            const stockName = $(".zzDege");
            if (stockName.text() == "") {
                finalString = "Wrong Name Entered";
            } else {
                const stockPrice = $(".fxKbKc");
                finalString = `*${stockName.text()}* \n*Price:-* ${stockPrice.text()}`;
            }
            await sock.sendMessage(chatId, { text: finalString }, { quoted: msg });
        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = new Crypto();
