import net from 'node:net';
import 'node:fs';

const SOCKET_FILE = "/tmp/meta-x.socket";

const send = (message) => {
  const client = net.createConnection(SOCKET_FILE);
  client.on("connect", () => {
    client.write(message);
    client.end();
  });
};

console.warn("This script is deprecated. Use bin/launch instead.");

send("run");
