import { io } from 'socket.io-client';
import { CONNECTTION_PORT } from '../Constant/Constant';

// export const socket = io(CONNECTTION_PORT, { autoConnect: false })
export const socket = io(CONNECTTION_PORT, { transports: ['websocket'], });
