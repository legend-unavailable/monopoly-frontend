import { useState } from "react";
import { useSocket } from "../SocketContext"
import { useEffect } from "react";

import dice1 from '../assets/dice/face1.png'
import dice2 from '../assets/dice/face2.png'
import dice3 from '../assets/dice/face3.png'
import dice4 from '../assets/dice/face4.png'
import dice5 from '../assets/dice/face5.png'
import dice6 from '../assets/dice/face6.png'

const DiceRoller = ({gameID, userInfo, isMyTurn, phase, turnOrderRolls, setTurnOrderRolls, updatePlayerLocation, sendMsg}) => {
    const {socket, rollDice} = useSocket();
    const [diceValues, setDiceValues] = useState([null, null]);
    const [rolling, setRolling] = useState(false);
    const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
    const hasRolled = turnOrderRolls.hasOwnProperty(userInfo.userID);
    const diceImgs = {1: dice1, 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6}
    const handleRoll = () => {
        if (!rolling && isMyTurn && (!hasRolled || phase === 'playing')) {
            console.log('m', diceValues);
            
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
        const handleDiceRolled = ({me, dice, isDoubles, phase}) => {
            console.log(me);
            
            if (me.userID === userInfo.userID) {
                setRolling(false);
            }
            if (phase === 'turnOrder') {
                
                setTurnOrderRolls((prev) => ({
                    ...prev, [me.userID]: dice
                }));
            }
            else{
                const totalRoll = dice.reduce((a, b) => a + b, 0);
                setDiceValues(dice);
                //replace with handleTurn eventually
                //sendMsg('All Players', me.username, `rolled ${totalRoll}`)                
                updatePlayerLocation(me.userID, totalRoll, {dice, isDoubles});
                if (me.userID === userInfo.userID) setHasRolledThisTurn(true);
            }
        };
        socket.on('diceRolled', handleDiceRolled);
        return () => socket.off('diceRolled', handleDiceRolled);
    }, [socket, userInfo, setTurnOrderRolls]);

    return(
        <div className="text-center m-3">
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