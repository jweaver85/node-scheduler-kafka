import * as Kafka from 'node-rdkafka';


const brokerUrl = process.env.BROKER_URL
// Kafka producer configuration
const producer = new Kafka.Producer({
    'metadata.broker.list': brokerUrl,
    'dr_cb': true, // Enable delivery reports
});

// Connect to the Kafka broker
producer.connect();

// Kafka topic names - probably unnecessary
const topics: string[] = process.env.TOPICS.split(',')

// Handle delivery reports
producer.on('delivery-report', (err: Kafka.LibrdKafkaError, report: Kafka.DeliveryReport) => {
    if (err) {
        console.error(`Error delivering message: ${err.message}`);
    } else {
        console.log(`Message delivered to topic ${report.topic}`);
    }
});

// Gracefully exit on interrupt signal
process.on('SIGINT', () => {
    producer.disconnect(() => {
        console.log('Disconnected from Kafka');
        process.exit(0);
    });
});
// let ready: boolean = false
// producer.on('ready', () => {
//     ready = true
// })

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
sleep(10000).then(() => {
    while (true) {
        // if (ready) {
        if (!producer.isConnected()) {
            console.warn("producer is not connected, reconnecting")
            try {
                producer.connect();
            } catch (e) {
                console.error("Error trying to reconnect: ", e)
            }

        }
        const message = 'Hello from the producer!';
// Produce the message to Kafka topic 1
        producer.produce(topics[0], null, Buffer.from(message), null, Date.now());
        console.log(`Producer: Produced message: ${message}`);
        // }
    }
})