import { WebSocket } from 'ws';
import { sendMessage } from "../ws/protocol";
import { RegData } from '../types';
import { usersByName, usersById, socketToUserId } from '../state/store';
import { User } from '../types';
import crypto from 'crypto';

export const handleReg = (ws: WebSocket, data: RegData): void => {
  if(!data || typeof data !== 'object'){
    sendMessage(ws, 'reg', {
      name: '',
      index: '',
      error: true,
      errorText: 'Invalid data',
    });
    return;
  }
    const name = data.name ;
    const password = data.password;
   
     const index = crypto.randomUUID();
   
     if (!name || !password) {
       sendMessage(ws, 'reg', {
         name,
         index: '',
         error: true,
         errorText: 'Name and password are required',
       });
       return;
     }
   
     const existingUser = usersByName.get(name);
   
     if(existingUser){
       if(existingUser.password !== password){
           sendMessage(ws, 'reg', {
               name,
               index: '',
               error: true,
               errorText: 'Invalid password',
           });
           return;
       }
       existingUser.ws = ws;
       usersById.set(existingUser.index, existingUser);
       socketToUserId.set(ws, existingUser.index);
   
       sendMessage(ws, 'reg', {
           name: existingUser.name,
           index: existingUser.index,
           error: false,
           errorText: '',
       });
       return;
     }
   
     const user: User = { name, password, index, ws };
     usersByName.set(name, user);
     usersById.set(index, user);
     socketToUserId.set(ws, index);
   
     sendMessage(ws, 'reg', { 
       name: user.name, 
       index: user.index, 
       error: false,
       errorText: '',
   });
   };
   