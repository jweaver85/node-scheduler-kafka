import * as schedule from 'node-schedule';
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
const topics: string[] = String(process.env.TOPICS).split(',')


// Schedule task 1 to run every minute
schedule.scheduleJob('*/1 * * * *', () => {
    if(!producer.isConnected()) {
        console.warn("producer is not connected, reconnecting")
        producer.connect();
    }
    const message = 'Task 1: Hello from the scheduler!';
    // Produce the message to Kafka topic 1
    producer.produce(topics[0], null, Buffer.from(message), null, Date.now());
    console.log(`Task 1: Produced message: ${message}`);
});

// Schedule task 2 to run every 5 minutes
schedule.scheduleJob('*/5 * * * *', () => {
    if(!producer.isConnected()) {
        console.warn("producer is not connected, reconnecting")
        producer.connect();
    }
    const message = 'Task 2: Hello from the scheduler!';
    // Produce the message to Kafka topic 2
    producer.produce(topics[1], null, Buffer.from(message), null, Date.now());
    console.log(`Task 2: Produced message: ${message}`);
});

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