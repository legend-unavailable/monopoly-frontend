import { useEffect, useState } from "react";
import DiceRoller from './DiceRoller'
import { useLocation, useParams } from "react-router-dom";

const Game = () => {
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [diceValues, setDiceValues] = useState([null, null]);
    const [rolling, setRolling] = useState(false);
    const [phase, setPhase] = useState('turnOrder');
    const [turnOrderRolls, setTurnOrderRolls] = useState({});
    const [turnQueue, setTurnQueue] = useState([]);
    const [currentTurnUserID, setCurrentTurnUserID] = useState(null);

    const {state} = useLocation();
    const gameInfo = state?.gameInfo;
    const {gameID} = useParams();
    const userID = gameInfo.userID;
    const username = gameInfo.username;
    const players = gameInfo.players;
    console.log(userID, username, players);
    


    useEffect(() => {   

        const allRolled = players.every(player => turnOrderRolls.hasOwnProperty(player._id.toString()));
        console.log(allRolled);
        console.log(turnOrderRolls);
        console.log();
        
        
        
        if (phase === 'turnOrder' && allRolled) {
            const order = players.map(player => {
                const dice = turnOrderRolls[player._id.toString()];
                return {
                    id: player._id.toString(),
                    total: dice.reduce((a, b) => a + b, 0)
                };
            }).sort((a, b) => b.total - a.total);
            console.log('Turn order:', order.map(p => p.id));
            setTurnQueue(order.map(p => p.id));
            setCurrentTurnUserID(order[0].id);
            setPhase('playing');            
        }
    }, [turnOrderRolls, players.length])


    return(
    <div className="container-fluid p-0">
        <div className="position-relative" style={{height: '100vh'}}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}></div>
        </div>
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
        <div className="position-relative p-4 h-100" style={{zIndex: 2}}>
            <DiceRoller
            gameID={gameID}
            userInfo={{userID}}
            isMyTurn={phase === 'turnOrder' || currentTurnUserID === userID}
            phase={phase}
            turnOrderRolls={turnOrderRolls}
            setTurnOrderRolls={setTurnOrderRolls}
            />
            
        </div>
        <DiceRoller 
        gameID={gameID} 
        userInfo={{userID}} 
        isMyTurn={phase === 'turnOrder' || currentTurnUserID === userID}
        phase={phase}
        turnOrderRolls={turnOrderRolls}
        setTurnOrderRolls={setTurnOrderRolls} />

        <div className="mt-4">
            <h4>Turn Order Rolls:</h4>
            {Object.entries(turnOrderRolls).map(([playerID, dice]) => {
                const player = players.find(p => p._id.toString() === playerID || p.userID === playerID)
                return (<div key={playerID}>
                    <span>{player ? player.username : 'unknown'}: {dice.join(', ')}</span>
                </div>
                )
            })}
        </div>
    </div>
    );
}

export default Game;