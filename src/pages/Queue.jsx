import {useLocation, useNavigate } from 'react-router-dom';
import hallway from '../assets/hallway.jpeg';
import scooter from '../assets/scooter.png';
import kart from '../assets/kart.png'
import plane from '../assets/plane.png'
import boat from '../assets/boat.png'
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../SocketContext';
import axios, { all } from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const Queue = () => {
    const [players, setPlayers] = useState([]);
    const [gameName, setGameName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [allReady, setAllReady] = useState(false);
    const [moversTaken, setMoversTaken] = useState([]);
    const moverRef = useRef('');
    const {socket, toggleReady, startGame, leaveGame} = useSocket();
    const moveTo = useNavigate();

    const {state} = useLocation();
    
    const userInfo = state?.userInfo;
    
    const gameID = userInfo.gameID;

    useEffect(() => {
        const getSession = async() => {
            try {
                const res = await axios.get(`${API_URL}/lobby`, {withCredentials: true});
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
            setPlayers(data.players);
            const taken = data.players.filter(player => player.isReady && player.mover).map(player => player.mover);
            //data.players.map(player => player.mover).filter(mover => mover);
            setMoversTaken(taken);
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
        const handleGameStarted = (data) => {
            moveTo(`/Game/${data.gameID}`, {state: {gameInfo: {players: data.players, userID: userInfo.userID, username: userInfo.username, mover: moverRef.current}}});
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
        const player = players.find(p => p.userID === userID);
        if (player && moverRef.current !== '') {
            toggleReady({
                gameID,
                userID: player.userID,
                isReady: !player.isReady,
                mover: moverRef.current
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

    const handleMover = (vehicle, e) => {
        e.preventDefault();
        if (!allReady) {
            moverRef.current = vehicle;
        }
        
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

                    <div className="row d-flex justify-content-around" style={{maxHeight: '400px'}}>
                        {players.map((player, index) => (
                            <div key={player.userID} className="card border-dark bg-dark col-5 m-2">
                                <div className="card-body text-light">
                                    <h2 className="card-title">{`Player ${index + 1}`}</h2>
                                    <h5 className="text-light">Username: {player.username}</h5>
                                    <h5 className="text-light">Status: {player.isReady ? 'Ready' : 'Not Ready'}</h5>
                                    <div className="text-center my-3">
                                        <h5 className="text-light">Pick your mover</h5>
                                        <div className="container">
                                            <img 
                                            src={scooter} 
                                            alt="scooter" 
                                            id='grn' 
                                            className={`img-fluid border m-1 ${moversTaken.includes('scooter') ? 'opacity-50': ''}`} 
                                            style={{maxHeight: '75px', width: '75px', cursor: moversTaken.includes('scooter') ? 'not-allowed' : 'pointer'}} 
                                            onClick={(e) => !moversTaken.includes('scooter') && handleMover('scooter', e)}/>
                                            <img 
                                            src={kart} 
                                            alt="kart" 
                                            id='red' 
                                            className={`img-fluid border m-1 ${moversTaken.includes('kart') ? 'opacity-50' : ''}`} 
                                            style={{maxHeight: '75px', width: '75px', cursor: moversTaken.includes('kart') ? 'not-allowed' : 'pointer'}}
                                            onClick={(e) => !moversTaken.includes('kart') && handleMover('kart', e)}/>
                                            <img 
                                            src={plane} 
                                            alt="plane" 
                                            id='gry' 
                                            className={`img-fluid border m-1 ${moversTaken.includes('plane') ? 'opacity-50' : ''}`}
                                            style={{maxHeight: '75px', width: '75px', cursor: moversTaken.includes('plane') ? 'not-allowed' : 'pointer'}}
                                            onClick={(e) => !moversTaken.includes('plane') && handleMover('plane', e)}/>
                                            <img 
                                            src={boat} 
                                            alt="boat" 
                                            id='blu' 
                                            className={`img-fluid border m-1 ${moversTaken.includes('boat') ? 'opacity-50' : ''}`} 
                                            style={{height: '75px', width: '75px', cursor: moversTaken.includes('boat') ? 'not-allowed' : 'pointer'}}
                                            onClick={(e) => !moversTaken.includes('boat') && handleMover('boat', e)}/>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center" >
                                        {player.userID === userInfo.userID && (
                                            <div className='mt-auto'>
                                                <button className={`btn ${player.isReady ? 'btn-secondary' : 'btn-success'} m-1 w-100`}
                                                onClick={() => handleReadyToggle(player.userID)}>
                                                    {player.isReady ? 'Unready' : 'Ready Up'}
                                                </button>
                                                <button className="btn btn-danger m-1 w-100"
                                                onClick={handleLeaveGame}>
                                                    Leave Room
                                                </button>
                                                {isHost && allReady && (
                                                    <div className="d-flex"></div>
                                                )}
                                                {isHost && allReady && (
                                                    <div className="d-flex justify-content-center mt-4">
                                                        <button className="btn btn-primary" onClick={handleGameStart}>
                                                            Start Game
                                                        </button>
                                                    </div>
                                                )}
                                            </div>  
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