import { useEffect, useState } from "react";
import DiceRoller from './DiceRoller'
import { useLocation, useParams } from "react-router-dom";
import Go from '../assets/Go.jpg'

const Game = () => {
    const [phase, setPhase] = useState('turnOrder');
    const [turnOrderRolls, setTurnOrderRolls] = useState({});
    const [turnQueue, setTurnQueue] = useState([]);
    const [currentTurnUserID, setCurrentTurnUserID] = useState(null);
    const [bgImage, setBgImage] = useState([]);

    const {state} = useLocation();
    const gameInfo = state?.gameInfo;
    const {gameID} = useParams();
    const userID = gameInfo?.userID;
    const username = gameInfo?.username;
    const players = gameInfo?.players;

    console.log(players);
    
    


    useEffect(() => {   
        console.log('players', players.map(p => p));
        console.log('turnOrderRolls keys', Object.keys(turnOrderRolls));
        
        
        const allRolled = players.length > 0 && players.every(player => turnOrderRolls.hasOwnProperty(player.userID.toString()));       
        console.log('all players roll', allRolled);
        console.log('current turnOrderRolls', turnOrderRolls);
        
        
        if (phase === 'turnOrder' && allRolled) {
            const order = players.map(player => {
                const dice = turnOrderRolls[player.userID.toString()];
                return {
                    id: player.userID.toString(),
                    total: dice.reduce((a, b) => a + b, 0)
                };
            }).sort((a, b) => b.total - a.total);
            const queue = order.map(p => p.id);
            console.log('turn order', queue);            
            setTurnQueue(queue);
            setCurrentTurnUserID(queue[0]);
            setPhase('playing');            
        }
    }, [turnOrderRolls, players, phase]);

    const endTurn = () => {
        const currentIndex = turnQueue.indexOf(currentTurnUserID);
        const nextIndex = (currentIndex + 1) % turnQueue.length;
        setCurrentTurnUserID(turnQueue[nextIndex]);
    };

    const ismyturn = currentTurnUserID === userID ;


    return(
    <div className="container-fluid p-0">
        <div className="position-relative" style={{height: '100vh'}}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                backgroundImage: `url(${Go})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}></div>
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
            <div className="position-relative p-4 h-100" style={{zIndex: 2}}>
                <h2 className="text-white mb-4">
                    Phase: {phase === 'turnOrder'?'Rolling for turn order':'Playing'}
                </h2>
                <h4 className="text-white">
                    {phase === 'playing'?ismyturn?"It's your turn":`Waiting for ${players.find(p => p.userID.toString() === currentTurnUserID)?.username || '...'}`:'Roll to determine turn order'}
                </h4>
                <DiceRoller
                gameID={gameID}
                userInfo={{userID}}
                isMyTurn={phase === 'turnOrder' || ismyturn}
                phase={phase}
                turnOrderRolls={turnOrderRolls}
                setTurnOrderRolls={setTurnOrderRolls}
                />

                <div className="mt-4 text-white">
                    <h4>Turn Order Rolls:</h4>
                    {Object.entries(turnOrderRolls).map(([playerID, dice]) => {
                        const player = players.find(p => p.playerID === playerID)
                        return (
                            <div key={playerID}>
                                <span>
                                    {player?player.username:'unknown'}: {dice.join(', ')}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {turnQueue.length > 0 && (
                    <div className="mt-3 text-white">
                        <h5>Turn Order Queue:</h5>
                        {turnQueue.map((id, index) => {
                            const player = players.find(p => p.userID.toString() === id);
                            return (
                                <div key={id}>
                                    {index + 1}. {player?.username || id}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
            
    </div>
    );
}

export default Game;