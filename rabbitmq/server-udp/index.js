const config = require("./local-config.json")
const sv = require("./server")
let producer;
const axios = require('axios');
const rp = require('request-promise');
const rb = require("./rabbit")

async function fetchData({ apiUrl, body}) {
    try {
        const response = await axios.post(apiUrl, body);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
}

const main = async () => {
    producer = await rb({});
    let server = await sv(config, handleMessage);
}

const handleMessage = async (msg, info) => {
    // console.log(info, msg.toString());
    if (typeof (msg.toString) != 'function') {
        console.log("msg is not valid");
        return;
    }
    const message = Buffer.from(msg).toString().split("KFJAEGERLOG");;
    console.log(message)
    //const jsonPart = message[1];
    //const logObject = JSON.parse(jsonPart);
    
    // Phân tích chuỗi JSON thành đối tượng JavaScript
    //const body = [logObject]
    producer.pushToJaegerQueue(msg);
    //await fetchData({apiUrl: "http://jaeger-collector-1:9411/api/v2/spans", body})

    // if (msg.toString().match(/KFJAEGERLOG/gi) != null) {
    //     producer.pushToJaegerQueue(msg);
    // }

}

main()
