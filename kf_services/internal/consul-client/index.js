const consul = require('consul');
const os = require('os');
async function createConnection({ config }) {
    // const connectConsul = new consul({ host: config.CONSUL.HOST, port: 8500 })
    // const servicePort = config.service_port;
    // const serviceName = config.service_name;
    // const osName = os.hostname();
    // connectConsul.agent.service.register({
    //     name: serviceName,
    //     port: servicePort,
    //     address: osName,  // Địa chỉ của container Docker
    //     check: {
    //       http: `http://${osName}:${servicePort}/${config.health}`,  // Endpoint kiểm tra sức khỏe của dịch vụ
    //       interval: '10s',  // Tần suất kiểm tra sức khỏe
    //     },
    // }, err => {
    //     if (err) throw err;
    //     console.log(`Registered ${serviceName} with Consul`);
    // });
}
module.exports = {
    createConnection,
}

