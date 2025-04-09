import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({children}) => {
    const socketRef = useRef(null);
    useEffect(() => {
        socketRef.current = io('http://localhost:3000', {withCredentials: true});
        const socket = socketRef.current;
        socket.on('connect', () => {console.log('socket connected', socket.id);})
        socket.on('connect_error', (err) => {console.log('socket disconnected: ', err);})
        socket.on('disconnect', (reason) => {console.log('socket disconnected:', reason);})
        
        socket.on('gameCreated', (data) => {
            console.log('game created', data);
            //more code needed
        });
        socket.on('createGameErr', (data) => {
            console.log('err creating game:', data.msg);
            //more code needed            
        });
        socket.on('newGameAvailable', (data) => {
            console.log('new game available', data);
            //more code needed            
        });
        socket.on('availableGames', (data) => {
            console.log('list of games available', data.games);
            setExistingGames(data.games);
            return () => {
                socket.off('availableGames');
            }
        });
        socket.on('gameUpdated', (data) => {
            console.log('game updated:', data);
            //more code needed            
        });
        socket.on('gameRemoved', (data) => {
            console.log('game removed:', data.gameID); 
            //more code needed           
        });
        /*socket.on('joinGameRoom', (data) => {
            console.log('joined game', data);
            //more code needed
        });*/
        socket.on('joinGameErr', (data) => {
            console.log('err joining game:', data.msg);
            //code needed
        });
        socket.on('playerJoined', (data) => {
            console.log('New player joined:', data);
            // Update players list
          });
        socket.on('playerLeft', (data) => {
            console.log('Player left:', data);
            // Update players list
          });
        socket.on('newHostAssigned', (data) => {
            console.log('New host assigned:', data);
            // Update host information
          });
        socket.on('chatMsg', (data) => {
            console.log('New chat message:', data);
            // Add message to chat display
          });
        socket.on('gameStarted', (data) => {
            console.log('Game has started:', data);
            // Navigate to game screen or update UI
          });
        socket.on('startGameErr', (data) => {
            console.error('Error starting game:', data.msg);
            // Show error message
          });
        
        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('gameCreated');
            socket.off('createGameErr');
            socket.off('newGameAvailable');
            socket.off('availableGames');
            socket.off('gameUpdated');
            socket.off('gameRemoved');
            socket.off('gameJoined');
            socket.off('joinGameErr');
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('newHostAssigned');
            socket.off('chatMsg');
            socket.off('gameStarted');
            socket.off('startGameErr');
            socket.disconnect();
            socketRef.current = null;
        }
    }, []);
    const socketInterface = {
        get socket() {
            return socketRef.current;
        },
        createGame: (data) => socketRef.current?.emit('createGameRoom', data),
        joinGame: (data) => socketRef.current?.emit('joinGameRoom', data),
        leaveGame: (data) => socketRef.current?.emit('leaveGameRoom', data),
        sendChatMessage: (data) => socketRef.current?.emit('sendChatmsg', data),
        startGame: (data) => socketRef.current?.emit('startGame', data),
        getAvailableGames: () => socketRef.current?.emit('getAvailableGames')
    };
    return (
        <SocketContext.Provider value={socketInterface}>
            {children}
        </SocketContext.Provider>
    );
}
export const useSocket = () => useContext(SocketContext);