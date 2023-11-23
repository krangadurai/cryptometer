const redis = require('redis');


class Cache {
    constructor() {
        const redisOptions = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
        };

        const redisURL = `redis://${redisOptions.password ? ':' + redisOptions.password + '@' : ''}${redisOptions.host}:${redisOptions.port}`;
        this.client = redis.createClient(redisURL);

        this.client.on('error', (err) => {
            console.error(`Redis error: ${err}`);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });
    }
    setValue(key, value) {
        this.client.set(key, value, (err, reply) => {
            if (err) {
                console.error('Error setting value:', err);
            } else {
                console.log('Value set successfully:', reply);
            }
        });
    }

    getValue(key, callback) {
        this.client.get(key, (err, reply) => {
            if (err) {
                console.error('Error getting value:', err);
                callback(err, null);
            } else {
                console.log('Retrieved value:', reply);
                callback(null, reply);
            }
        });
    }

    editValue(key, newValue) {
        this.client.get(key, (err, oldValue) => {
            if (err) {
                console.error('Error getting value to edit:', err);
            } else if (oldValue) {
                this.client.set(key, newValue, (setErr, reply) => {
                    if (setErr) {
                        console.error('Error editing value:', setErr);
                    } else {
                        console.log('Value edited successfully. New value:', newValue);
                    }
                });
            } else {
                console.error('Key not found for editing');
            }
        });
    }

    deleteValue(key) {
        this.client.del(key, (err, reply) => {
            if (err) {
                console.error('Error deleting value:', err);
            } else {
                console.log('Value deleted:', reply === 1 ? 'Key was deleted' : 'Key not found');
            }
        });
    }
}


module.exports = new Cache();