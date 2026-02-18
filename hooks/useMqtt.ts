'use client'
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

export const useMqtt = (host: string, topic: string) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    mqttClient.on('connect', () => {
        console.log("Connected to Broker! ✅");
        setStatus('Connected');
        mqttClient.subscribe('greenhouse/data');
      });
    
      mqttClient.on('error', (err) => {
        console.error("Connection Error: ", err);
        setStatus('Error: ' + err.message);
      });
    
      // Log incoming messages to be sure data is arriving
      mqttClient.on('message', (topic, message) => {
        console.log("New Data: ", message.toString());
        setData(JSON.parse(message.toString()));
      });

    setClient(mqttClient);
    return () => { mqttClient.end(); };
  }, [host, topic]);

  const publish = (subTopic: string, message: string) => {
    if (client) {
      // The topic must match the ESP32 subscriptions exactly
      const fullTopic = `greenhouse/cmd/${subTopic}`; 
      client.publish(fullTopic, message);
      console.log(`Sent ${message} to ${fullTopic}`);
    }
  };

  return { data, status, publish };
};