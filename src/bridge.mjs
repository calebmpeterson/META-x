import net from "node:net";
import fs from "node:fs";

const SOCKET_FILE = "/tmp/meta-x.socket";

const createServer = (socket, onMessage) => {
  const server = net
    .createServer((stream) => {
      stream.on("data", (buffer) => {
        const message = buffer.toString();
        try {
          onMessage(message);
        } catch (error) {
          console.error(
            `Error encountered while handling message "${message}"`,
            error
          );
        }
      });
    })
    .listen(socket);

  return server;
};

export const listen = (onMessage) => {
  // Remove any stale socket file
  const lockExists = fs.existsSync(SOCKET_FILE);
  if (lockExists) {
    fs.unlinkSync(SOCKET_FILE);
  }

  const server = createServer(SOCKET_FILE, onMessage);

  const cleanup = () => {
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
};

export const send = (message) => {
  const client = net.createConnection(SOCKET_FILE);
  client.on("connect", () => {
    client.write(message);
    client.end();
  });
};
