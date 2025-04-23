import { useState } from "react";
import { useSocket } from "../SocketContext"
import { useEffect } from "react";

import dice1 from '../assets/dice/face1.png'
import dice2 from '../assets/dice/face2.png'
import dice3 from '../assets/dice/face3.png'
import dice4 from '../assets/dice/face4.png'
import dice5 from '../assets/dice/face5.png'
import dice6 from '../assets/dice/face6.png'

const DiceRoller = ({gameID, userInfo, isMyTurn, phase, turnOrderRolls, setTurnOrderRolls, updatePlayerLocation}) => {
    const {socket, rollDice} = useSocket();
    const [diceValues, setDiceValues] = useState([null, null]);
    const [rolling, setRolling] = useState(false);
    const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
    const hasRolled = turnOrderRolls.hasOwnProperty(userInfo.userID);
    const diceImgs = {1: dice1, 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6}
    const handleRoll = () => {
        if (!rolling && isMyTurn && (!hasRolled || phase === 'playing')) {
            setRolling(true);            
            rollDice({gameID, userID: userInfo.userID, phase});
        }
    };
    
    useEffect(() => {
        if (isMyTurn) {
            setHasRolledThisTurn(false);
        }
    }, [isMyTurn])

    useEffect(() => {
        if (!socket) return;
        const handleDiceRolled = ({userID, dice, phase}) => {
            if (userID === userInfo.userID) {
                setRolling(false);
            }
            if (phase === 'turnOrder') {
                
                setTurnOrderRolls((prev) => ({
                    ...prev, [userID]: dice
                }));
            }
            else{
                const totalRoll = dice.reduce((a, b) => a + b, 0);
                setDiceValues(dice);
                //replace with handleTurn eventually
                updatePlayerLocation(userID, totalRoll);
                if (userID === userInfo.userID) setHasRolledThisTurn(true);
            }
        };
        socket.on('diceRolled', handleDiceRolled);
        return () => socket.off('diceRolled', handleDiceRolled);
    }, [socket, userInfo, setTurnOrderRolls]);

    return(
        <div className="text-center">
            <div className="d-flex justify-content-center mt-2">
                {diceValues.map((val, i) => (
                    <div className="mx-2" key={i}>
                        {val !== null ? (
                            <img 
                            src={diceImgs[val]} 
                            alt={`Dice ${val}`}
                            style={{width: '60px', height: '60px'}}/>
                        ) : (
                            <div style={{width: '60px', height: '60px', background: '#eee', borderRadius: '8px'}}/>
                        )}
                    </div>
                ))}
            </div>
            <button 
            className="btn btn-primary m-2"
            disabled={rolling || (phase === 'turnOrder' && hasRolled) || (phase === 'playing' && (!isMyTurn || hasRolledThisTurn))}
            onClick={handleRoll}>
                {rolling ? 'Rolling' : 'Roll Dice'}
            </button>
        </div>
    )
}

export default DiceRoller;