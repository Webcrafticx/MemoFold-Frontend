import { io } from "socket.io-client";
import config from "./hooks/config";

const socket = io(`${config.socketUrl}`, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
