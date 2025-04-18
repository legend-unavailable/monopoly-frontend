import { useState } from "react";
import { useSocket } from "../SocketContext"
import { useEffect } from "react";

const DiceRoller = ({gameID, userInfo, isMyTurn, phase, turnOrderRolls, setTurnOrderRolls}) => {
    const {socket, rollDice} = useSocket();
    const [diceValues, setDiceValues] = useState([null, null]);
    const [rolling, setRolling] = useState(false);
    const hasRolled = turnOrderRolls.hasOwnProperty(userInfo.userID);

    const handleRoll = () => {
        console.log('in handleroll');
        console.log(userInfo.userID);
        
        
        if (!rolling && isMyTurn && (!hasRolled || phase === 'playing')) {
            setRolling(true);
            console.log(gameID, userInfo.userID, phase);
            
            rollDice({gameID, userID: userInfo.userID, phase});
        }
    };
    

    useEffect(() => {
        if (!socket) return;
        const handleDiceRolled = ({userID, dice, phase}) => {
            if (userID === userInfo.userID) {
                setRolling(false);
            }
            if (phase === 'turnOrder') {
                console.log('updating roll for', userID, 'with', dice);
                
                setTurnOrderRolls((prev) => ({
                    ...prev, [userID]: dice
                }));
            }
            else{
                setDiceValues(dice);
            }
        };
        socket.on('diceRolled', handleDiceRolled);
        return () => socket.off('diceRolled', handleDiceRolled);
    }, [socket, userInfo, setTurnOrderRolls]);

    return(
        <div className="text-center">
            <button 
            className="btn btn-primary"
            disabled={!isMyTurn || rolling || (phase === 'turnOrder' && hasRolled)}
            onClick={handleRoll}>
                {rolling ? 'Rolling' : 'Roll Dice'}
                {console.log('ismyturn', !isMyTurn, 'rolling: ', rolling)
                }
            </button>
            <div className="d-flex justify-content-center mt-2">
                {diceValues.map((val, i) => (
                    <div className="mx-2" key={i}>
                        {val !== null ? (
                            <img 
                            src={`../assets/dice/face${val}.png`} 
                            alt={`Dice ${val}`}
                            style={{width: '60px', height: '60px'}}/>
                        ) : (
                            <div style={{width: '60px', height: '60px', background: '#eee', borderRadius: '8px'}}/>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DiceRoller;