import * as Kafka from 'node-rdkafka';

// Kafka consumer configuration
console.log("starting consumer...")
const consumer = new Kafka.KafkaConsumer({
    'group.id': process.env.GROUP_ID,
    'metadata.broker.list': process.env.BROKER_URL,
}, {});

// Connect to the Kafka broker
consumer.connect();

// Subscribe to the Kafka topic(s)
consumer.on('ready', () => {
    console.log("subscribing to topics: ", process.env.TOPICS)
    consumer.subscribe(process.env.TOPICS.split(','));
})
consumer.on("event.event", (message) => {
    console.log(`(event.event) Received message: ${message.value?.toString()}`);
})
// Handle incoming messages
consumer.on('data', (message) => {
    console.log(`(data) Received message: ${message.value?.toString()}`);
});

// Handle errors
consumer.on('event.error', (error) => {
    console.error(`Consumer error: ${error}`);
});

// Gracefully exit on interrupt signal
process.on('SIGINT', () => {
    consumer.disconnect(() => {
        console.log('Disconnected from Kafka');
        process.exit(0);
    });
});