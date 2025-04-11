import {useLocation, useNavigate } from 'react-router-dom';
import hallway from '../assets/hallway.jpeg';
import { useEffect, useState } from 'react';
import { useSocket } from '../SocketContext';
import axios from 'axios';

const Queue = () => {
    const [players, setPlayers] = useState([]);
    const [gameName, setGameName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [allReady, setAllReady] = useState(false);
    const {socket, toggleReady, startGame, leaveGame} = useSocket();
    const moveTo = useNavigate();

    const {state} = useLocation();
    console.log(state);
    
    const userInfo = state?.userInfo;
    console.log(userInfo);
    
    const gameID = userInfo.gameID;

    useEffect(() => {
        const getSession = async() => {
            try {
                const res = await axios.get('http://localhost:3000/lobby', {withCredentials: true});
                if (res.data.authenticated) {
                    return;
                }
            } catch (err) {
                console.log(err);
                moveTo('/');
            }
        };
        getSession();
    }, [])
    
    
    useEffect(() => {
        if (socket) {
        const handleGameJoined = (data) => {
            setPlayers(data.players);
            setGameName(data.gameName);
            setIsHost(data.hostPlayerID === userInfo.userID);
        };
        const handlePlayerStatusUpdated = (data) => {
            console.log('updated players', data.players);
            
            setPlayers(data.players);
            const ready = data.players.length >= 2 && data.players.every(p => p.isReady);
            setAllReady(ready);
        };
        const handlePlayerJoined = (data) => {
            setPlayers(data.players);
        };
        const handlePlayerLeft = (data) => {
            setPlayers(data.players);
        };
        const handleNewHostAssigned = (data) => {
            setPlayers(data.newHostID === userInfo.userID);
        };
        const handleGameStarted = () => {
            moveTo('/Game');
        };

        socket.on('gameJoined', handleGameJoined);
        socket.on('playerStatusUpdated', handlePlayerStatusUpdated);
        socket.on('playersUpdated', handlePlayerJoined);
        socket.on('playerLeft', handlePlayerLeft);
        socket.on('newHostAssigned', handleNewHostAssigned);
        socket.on('gameStarted', handleGameStarted);

        socket.emit('joinGameRoom', {
            gameID,
            userID: userInfo.userID,
            username: userInfo.username
        });
        return() => {
            socket.off('gameJoined', handleGameJoined);
            socket.off('playerStatusUpdated', handlePlayerStatusUpdated);
            socket.off('playersUpdated', handlePlayerJoined);
            socket.off('playerLeft', handlePlayerLeft);
            socket.off('newHostAssigned', handleNewHostAssigned);
            socket.off('gameStarted', handleGameStarted);            
        };}
    }, [gameID, userInfo, socket, moveTo]);

    const handleReadyToggle = (userID) => {
        console.log(userID);
        
        const player = players.find(p => p.userID === userID);
        if (player) {
            console.log('new', player.userID, player.isReady);
            
            toggleReady({
                gameID,
                userID: player.userID,
                isReady: !player.isReady
            });
        }
    };

    const handleGameStart = () => {
        if (isHost && allReady) {
            startGame({
                gameID,
                hostID: userInfo.userID
            });
        }
    };

    const handleLeaveGame = () => {
        leaveGame({
            gameID,
            userID: userInfo.userID
        });
        moveTo('/Lobby');
    }
    
    return (
        <div className="container-fluid p-0">
            <div className="position-relative" style={{height: '100vh'}}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    backgroundImage: `url(${hallway})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}></div>

                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
                <div className="position-relative p-4 h-100" style={{zIndex: 2}}>

                    <div className="d-flex justify-content-center pb-5">
                        <h1 className="text-light">
                            {gameName}
                        </h1>
                    </div>

                    <div className="row d-flex justify-content-around" style={{height: '75%'}}>
                        {players.map((player, index) => (
                            <div key={player.userID} className="card border-dark bg-dark col-5 m-2">
                                <div className="card-body text-light">
                                    <h2 className="card-title">{`Player ${index + 1}`}</h2>
                                    <h5 className="text-light">Username: {player.username}</h5>
                                    <h5 className="text-light">Status: {player.isReady ? 'Ready' : 'Not Ready'}</h5>
                                    <div className="container d-flex flex-column justify-content-end" style={{height: '65%'}}>
                                        {player.userID === userInfo.userID && (
                                            <>
                                            <button className={`btn ${player.isReady ? 'btn-secondary' : 'btn-success'} m-1`}
                                            onClick={() => handleReadyToggle(player.userID)}>
                                                {player.isReady ? 'Unready' : 'Ready Up'}
                                            </button>
                                            <button className="btn btn-danger m-1"
                                            onClick={handleLeaveGame}>
                                                Leave Room
                                            </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Queue;