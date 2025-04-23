import { useEffect, useState } from "react";
import DiceRoller from './DiceRoller'
import { data, useLocation, useParams } from "react-router-dom";
import locations from '../locationImgs';
import axios from "axios";

import property from '../assets/cardFace/properties.png'
import lifestyle from '../assets/cardFace/lifestyle.png'
import fortune from '../assets/cardFace/fortune.png'

import scooter from '../assets/scooter.png';
import kart from '../assets/kart.png';
import boat from '../assets/boat.png';
import plane from '../assets/plane.png';
import { useSocket } from "../SocketContext";


const Game = () => {
    const {socket, sendChatMessage, buyProperty} = useSocket();
    const [phase, setPhase] = useState('turnOrder');
    const [turnOrderRolls, setTurnOrderRolls] = useState({});
    const [turnQueue, setTurnQueue] = useState([]);
    const [currentTurnUserID, setCurrentTurnUserID] = useState(null);

    const [nextbgImage, setNextBgImage] = useState(null);
    const [currentbgImage, setCurrentBgImage] = useState(null);
    const [fadeIn, setFadeIn] = useState(false);
    const [location, setLocation] = useState('Go');

    const [propsOn, setPropsOn] = useState(false);

    const [textMsg, setTextMsg] = useState('');

    //has moverLevel, balance, location, turnOrder, and mover
    const [dbplayer, setdbPlayers] = useState([]);
    //baseRent, color, hotelCost, houseCost, mortageValue, name, position, priceTag
    const [properties, setProperties] = useState([]);

    const [landedProperty, setLandedProperty] = useState(null);
    const [popUp, setPopUp] = useState(false);

    const [dropdown, setDropdown] = useState('All Players');
    const [chatMsgs, setChatMsgs] = useState([]);
    const [msg, setMsg] = useState('');;

    const {state} = useLocation();
    const gameInfo = state?.gameInfo;
    const {gameID} = useParams();
    const userID = gameInfo?.userID;
    const username = gameInfo?.username;
    const players = gameInfo?.players;
    const mover = gameInfo?.mover;
    

    const moverImgs = {scooter, kart, plane, boat};
    //get players and properties
    useEffect(() => {
        const getPlayersInfo = async() => {
            try {
                const res = await axios.get(`http://localhost:3000/game?gameID=${gameID}`, {withCredentials: true});
                if(res.data && res.data.players) {
                    setdbPlayers(res.data.players);
                    setProperties(res.data.properties);
                }
                console.log(res.data.players);
                console.log('pr', res.data.properties);
                
                
            } catch (err) {
                console.log('Err fetching players:', err);
            }
        }
        getPlayersInfo();
    }, [])

    //changes bg img
    useEffect(() => {
        const me = dbplayer.find(p => p.userID === userID);
        if (me && me.location != undefined) {
            const property = (locations[me.location] || locations[0]);
            const bg = location.img;
            if (bg !== currentbgImage) {
                //setNextBgImage(bg);
                setFadeIn(true);
                setTimeout(() => {
                    setCurrentBgImage(bg);
                    setFadeIn(false);
                    setNextBgImage(null);
                }, 1000);
            }
            setLocation(property);
        }
    }, [dbplayer, location, currentbgImage, nextbgImage])
    
    //switch from getting turn order to playing
    useEffect(() => { 
        const allRolled = players.length > 0 && players.every(player => turnOrderRolls.hasOwnProperty(player.userID.toString()));        
        
        if (phase === 'turnOrder' && allRolled) {
            const order = players.map(player => {
                const dice = turnOrderRolls[player.userID.toString()];
                return {
                    id: player.userID.toString(),
                    total: dice.reduce((a, b) => a + b, 0)
                };
            }).sort((a, b) => b.total - a.total);
            const queue = order.map(p => p.id);           
            setTurnQueue(queue);
            setCurrentTurnUserID(queue[0]);
            setPhase('playing');            
        }
    }, [turnOrderRolls, players, phase]);

    //socket functions
    useEffect(() => {
        if (!socket) return;
        //socket msg
        const handleChatMsg = (data) => {
            console.log('received', data);
            
            setChatMsgs((prev) => [...prev, data]);
        }
        //socket purchase
        const handlePurchaseUpdate = (data) => {
            setdbPlayers(prevPlayers => 
                prevPlayers.map(p => p.userID === userID
                    ? {...p, balance: data.balance} : p
                )
            );
            setProperties(prevProps => {
                prevProps.map(p => 
                    p.propertyID === data.propertyID ? {...p, ownerID: data.userID}: p
                )
            });
            setDropdown('All Players');
            const prop = properties.find(p => p.propertyID === data.propertyID);
            setMsg(`has bought ${prop.name}`);
            sendMsg();
        }
        socket.on('propertyPurchaseUpdate', handlePurchaseUpdate)
        socket.on('chatMsg', handleChatMsg);
        return() => {
            socket.off('chatMsg', handleChatMsg);
            socket.off('properyPurchaseUpdate', handlePurchaseUpdate);
        };
    }, [socket]);

    //ADD: final stage
    const endTurn = () => {
        const currentIndex = turnQueue.indexOf(currentTurnUserID);
        const nextIndex = (currentIndex + 1) % turnQueue.length;
        setCurrentTurnUserID(turnQueue[nextIndex]);
    };

    //remove
    const updatePlayerLocation = (userID, diceTotal) => {
        setdbPlayers( prevPlayers => prevPlayers.map(player => {
            if (player.userID === userID) {
                const currentPos = player.location || 0;
                const newPos = (currentPos + diceTotal) % locations.length;
                return {...player, location: newPos};
            }
            return player
        }));
    }

    //send msg
    const sendMsg = () => {
        if (!msg.trim()) return;
        const payload = {
            gameID,
            sender: username,
            receiver: dropdown === 'All Players' ? 'all': dropdown,
            msg: msg.trim()
        };      
        sendChatMessage(payload);
        setMsg('');
    }

    const ismyturn = phase === 'turnOrder'?
    !turnOrderRolls.hasOwnProperty(userID) :
    currentTurnUserID === userID;

    const handleTurn = (userID, diceTotal) => {
        const me = dbplayer.find(p => p.userID === userID);
        const currentPos = me.location || 0;
        const newPos = (currentPos + diceTotal) % locations.length;
        const passedGo = (currentPos + diceTotal) >= locations.length;
        //passed GO
        if (passedGo) {
            setPopUp({
                type: 'Go',
                data: {
                    me,
                    upgrade: (me.moverLevel < 5)
                }
            })
        }
        const bleh = newPos == 2 || newPos == 5 || newPos == 8 || newPos == 13 || newPos == 16 || newPos == 18 || newPos == 24 || newPos == 27 || newPos == 29 || newPos == 0 
        //ADD: check if justVistsing or free parking
        //ADD: check if jail
        //ADD: check if card
        if (bleh) {
            
        }
        //lands on property
        else {
            const property = properties.find(p => p.position === newPos);
            //property is owned by someone else
            if (property.ownerID && property.ownerID !== userID) {
                const owner = dbplayer.find(p => p.userID === property.ownerID);
                handlePayment(me, owner, property);
            }
            else {
                //has fortune card
                if (property.fortuneExists) {
                    //ADD: collect fortune
                }
                setLandedProperty(property);
            }
        }
    }
    //player
    const handlePropertyPurchase = (userID, property, ans) => {
        if (ans === 'yes') {
            setdbPlayers(prevPlayers => 
                prevPlayers.map(player =>
                    player.userID === userID
                        ? {...player, balance: player.balance - property.priceTag}
                        : player
                 )
            );
            setProperties(prevProps =>
                prevProps.map(prop =>
                    prop._id === property._id
                        ? {...prop, ownerID: userID}
                        : prop
                )
            );
            setLandedProperty(null);
            buyProperty({gameID, userID, propertyID: property.id})
        }
        setLandedProperty(null);
    }
    //player owes rent
    const handlePayment = (user, owner, property) => {
        //property not mortaged
        if (!property.isMortaged) {
            //property has hotel
            if (property.hasHotel) {
                setPopUp({
                    type: 'payment',
                    data: {
                        payer: user,
                        amt: property.rentWthHotel,
                        owner: owner
                    }
                });
                return;
            }
            //property has houses
            else if (property.amtOfHouses !== 0) {
                const price = property.rentWithHouses[property.amtOfHouses-1];
                setPopUp({
                    type: 'payment',
                    data: {
                        payer: user,
                        amt: price,
                        owner: owner
                    }
                });
                return;
            }
            // no buildings
            else {
                const coloredProps = properties.filter(p => p.color === property.color);
                //owner has complete set
                if (coloredProps.every(p => p.ownerID === owner.userID && p.amtOfHouses === 0)) {
                    setPopUp({
                        type: 'payment',
                        data: {
                            payer: user,
                            amt: property.baseRent * 2,
                            owner: owner
                        }
                    })
                    return;
                }
                //owner doesnt have complete set
                else {
                    setPopUp({
                        type: 'payment',
                        data: {
                            payer: user,
                            amt: property.baseRent,
                            owner: owner
                        }
                    });
                    return;
                }
            }
        }
        //ADD: final stage
    }

    const handleEvents = () => {
        //paying rent
        if (popUp.type === 'payment') {
            //cant afford rent
            if (popUp.data.payer.balance < popUp.data.amt) {
                const ownedProps = properties.filter(p => p.ownerID === popUp.data.payer.userID);
                setPopUp({
                    type: 'broke',
                    data: {
                        payer: popUp.data.payer,
                        amt: popUp.data.amt,
                        owner: popUp.data.owner,
                        ownedProps
                    }
                });
                return;
            }
            setdbPlayers(prevPlayer => 
                prevPlayer.map(p => {
                    if (p.userID === user.userID) {
                        return {...p, balance: p.balance - (popUp.data.amt)};
                    }
                    else if (p.userID = property.ownerID) {
                        return {...p, balance: p.balance + (popUp.data.amt)};
                    }
                    else {
                        return p;
                    }
                })
            );
            setPopUp(null);
        }
        //salary and upgrading
        else if (popUp.type === 'Go') {
            let salary = 150000;
            let moverLvl = popUp.data.me.moverLevel;
            if (popUp.data.deduct != 0) {
                salary -= 50000;
                moverLvl = popUp.data.me.moverLevel + 2;
            }
            if (popUp.data.me.moverLevel > 1) {
                if (popUp.data.me.moverLevel > 3) {
                    salary += 50000;
                }
                salary += 50000;
            } 
            setdbPlayers(prevPlayers => {
                prevPlayers.map(p => 
                    p.userID === popUp.data.me.userID ?
                        {...p, balance: p.balance + salary, moverLevel: moverLvl} :
                        p
                )
            });
            setPopUp(null);
        }
        else if (popUp.type === 'broke') {
            setPropsOn(true);
        }
    }
    //mortgage property
    const mortgagaProperty = (prop) => {
        let price = 0;
        //sell hotel & houses
        if (prop.hasHotel) {
            price += (prop.houseCost * 5 * 0.5)
        }
        //sell houses
        else if (prop.amtOfHouses !== 0) {
            price += (prop.houseCost * prop.amtOfHouses * 0.5)
        }
        //mortgage
        setProperties(prevProps =>
            prevProps.map(p => {
                if (p.ownerID === popUp.data.payer.userID) {
                    return {...p, hasHotel: false, amtOfHouses: 0, isMortgaged: true}
                }
                else return p;
            })            
        )
        price += prop.mortgageValue;
        setdbPlayers(prevPlayer => 
            prevPlayer.map(p => {
                if (p.userID === popUp.data.payer.userID) {
                    return {...p, balance: p.balance + price};
                }
                else {
                    return p;
                }
            })
        );
        setPopUp({
            type: 'payment',
            data: {
                payer: popUp.data.payer,
                amt: popUp.data.amt,
                owner: popUp.data.owner
            }
        });
        setPropsOn(false);

    }
    
    
    return(
    <div className="container-fluid p-0">
        <style>
            {`
                .background-wrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                    z-index: 0;
                }
                
                .background-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    background-size: cover;
                    background-position: center;
                    opacity: 0;
                    transition: opacity 1s ease-in-out;
                    z-index: 0;
                }

                .background-layer.show{
                    opacity: 1;
                    z-index: 1;
                }

                .background-layer.hide{
                    opacity: 0;
                    z-index: 0;
                }
            `}
        </style>
        <div className="position-relative" style={{height: '100vh'}}>
            <div className="background-wrapper">
                {currentbgImage && (
                    <div className={`background-layer ${!fadeIn ? 'show': 'hide'}`}
                    style={{backgroundImage: `url(${currentbgImage})`}}></div>
                )}
                {nextbgImage && (
                    <div className={`background-layer ${fadeIn ? 'show': 'hide'}`}
                    style={{backgroundImage: `url(${nextbgImage})`}}></div>
                )}
            </div>
            
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
            <div className="position-relative p-4 h-100" style={{zIndex: 2}}>
                <div className="d-flex h-100">
                    <div className="container border border-color-dark h-100">
                        <div className="d-flex flex-column justify-content-end h-100 m5-auto text-white">
                            <div className=" w-25 m-1" style={{height: '15%'}}>
                                <img src={fortune} alt="Fortunes" className="img-fluid h-100 w-auto" />
                            </div>
                            <div className=" w-50 m-1" style={{height: '35%'}}>
                                <img src={lifestyle} alt="Cards" className="img-fluid h-100 w-auto" />
                            </div>
                            <div className=" w-50 m-1" style={{height: '35%'}}>
                                <img src={property} alt="Properties" className="img-fluid h-100 w-auto" />
                            </div>
                        </div>
                    </div>
                    <div className="container border border-color-dark h-100">
                        <div className="container h-100 d-flex flex-column justify-content-between">
                            <h1 className="text-white text-center m-3">{location?.name? location.name: ''}</h1>
                            <div className="container m-3">
                                <h3 className="text-white">
                                    {phase === 'playing'?ismyturn?"It's your turn":`Waiting for ${players.find(p => p.userID === currentTurnUserID)?.username || '...'}`:'Roll to determine turn order'}
                                </h3>
                            </div>
                            <div className="container border border-white h-25 w-50 mt-3 mb-3">
                                Mover
                                <img src={moverImgs[mover]} alt={mover} className="img-fluid h-50 w-100" />
                            </div>
                            {/*phase === 'turnOrder' && landedProperty == null && */(
                            <div className="container p-3">
                                <h2 className="text-white ">
                                    {phase === 'turnOrder'?'Roll the dice to determine turn order':''}
                                </h2>
                                <DiceRoller 
                                gameID={gameID}
                                userInfo={{userID}}
                                isMyTurn={ismyturn}
                                phase={phase}
                                turnOrderRolls={turnOrderRolls}
                                setTurnOrderRolls={setTurnOrderRolls}
                                updatePlayerLocation={handleTurn}
                                />
                                <div className=" text-white">
                                    <h4>Turn Order Rolls</h4>
                                    {Object.entries(turnOrderRolls).map(([playerID, dice]) => {
                                        const player = players.find(p => p.userID === playerID);                                       
                                        return (
                                            <div key={playerID}>
                                                <span>{player?player.username:'Unknown'}: {dice.join(', ')}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {turnQueue.length > 0 && (
                                    <div className=" text-white">
                                        <h5>Turn Order Queue</h5>
                                        {turnQueue.map((id, index) => {
                                            const player = players.find( p => p.userID === id);
                                            return(
                                                <div key={id}>
                                                    {index + 1}. {player?.username || id}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>)}
                            {phase === 'playing' && landedProperty && (
                                <div className="container p-3 text-white bg-dark rounded shadow">
                                    <h3>Do you want to buy this property for ${landedProperty.priceTag}</h3>
                                    <button className="btn btn-success me-2" onClick={() => handlePropertyPurchase(userID, landedProperty, 'yes')}>
                                        Buy
                                    </button>
                                    <button className="btn btn-danger me-2" onClick={() => handlePropertyPurchase(userID, landedProperty, 'no')}>
                                        Skip
                                    </button>

                                </div>
                            )} 
                            {popUp.type === 'Go' && (
                                <div className="container p-3 text-white bg-dark rounded shadow">
                                    {popUp.data.upgrade && (
                                        <div>
                                            <h3>Do you want to upgrade your mover? $50,000 will be taken out of salary if yes.</h3>
                                            <button className="btn btn-success me-2" onClick={() => setPopUp({type: 'Go', data: {me: popUp.data.me, upgrade: false, deduct: 50000}})}>
                                                Upgrade
                                            </button>
                                            <button className="btn btn-danger me-2" onClick={() => setPopUp({type: 'Go', data: {me: popUp.data.me, upgrade: false, deduct: 0}})}>
                                                Skip
                                            </button>
                                        </div>
                                    )}
                                    <button className="btn btn-success"
                                    disabled={popUp.data.upgrade}
                                    onClick={() => handleEvents()}
                                    >
                                        Collect Salary
                                    </button>

                                </div>
                            )}
                            {popUp.type === 'payment' && (
                                <div className="container p-3 bg-dark rounded shadow">
                                    <h3 className="text-white">
                                        You must pay ${popUp.data.amt} in rent to {popUp.data.owner.username}.
                                    </h3>
                                    <button className="btn btn-secondary" onClick={() => handleEvents()}>
                                        Accept
                                    </button>
                                </div>
                            )}
                            {popUp.type === 'broke' && (
                                <div className="container border border-white bg-dark">
                                    <h3 className="text-white">
                                        You must don't have enough money to pay 
                                    </h3>
                                    <div className="container">
                                        <button className="btn btn-danger">
                                            Declare Bankruptcy
                                        </button>
                                        <button className="btn btn-danger"
                                        onClick={() => handleEvents()}
                                        disabled={popUp.data.ownedProps.every(p => p.isMortaged === true)}
                                        >
                                            Mortgage your properties
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="container border border-dark d-flex flex-column justify-content-between h-100">
                        section 3
                        {dbplayer.map(player => (
                            <div className="d-flex bg-dark bg-opacity-75 p-2 rounded text-white" key={player.userID}>
                                <span>{player.username}: ${player.balance}</span>
                            </div>
                        ))}
                        <div className="border border-color-light bg-light mt-auto h-50 d-flex flex-column">
                            <div className="border border-color-dark h-100">
                                {chatMsgs.map((m, i) => (
                                    <div key={i}>
                                        <strong>{m.sender}</strong>: {m.msg}
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex">
                                <div className="btn-group dropup">
                                    <button className="btn btn-secondary btn-sm">
                                        {dropdown}
                                    </button>
                                    <button className="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle='dropdown' aria-expanded='false'>
                                        <span className="visually-hidden">Toggle Dropdown</span>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li key={0}>
                                            <button className="dropdown-item" onClick={() => setDropdown('All Players')}>
                                                All Players
                                            </button>
                                        </li>
                                        {players.map(player => (
                                            <li key={player.userID}>
                                                <button className="dropdown-item" onClick={() => setDropdown(player.username)}>
                                                    {player.username}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="form-floating w-100">
                                    <input type="text" className="form-control" id='msg' value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()}/>
                                    <label for="msg">Message</label>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {propsOn && (
                    <div className="container h-100">
                        <div className="container border border-white bg-dark">
                            {popUp.type === 'broke' && (
                                <div>
                                    {popUp.data.ownedProps.map(p => 
                                        <div className={`container border border-white bg-${p.color}`}>
                                            <h3 className={`border border-white text-black`}>
                                                {p.name}
                                            </h3>
                                            {p.isMortaged && (
                                                <h2 className="border border-white text-white">
                                                    This property is already mortgaged
                                                </h2>
                                            )}
                                            {!p.isMortaged && (
                                                <div className="container border border-white">
                                                    <h5 className="text-white">Rent: ${p.baseRent}</h5>
                                                    Rent: ${p.baseRent}
                                                    {p.rentWithHouses.map((rents, index) => (
                                                        <h5 className="text-white">Rent with {index + 1} house/s: ${rents}</h5>
                                                    ))}
                                                    <h5 className="text-white">Rent with a hotel: ${p.rentWhitHotel}</h5>
                                                    <h5 className="text-white">Cost of houses and hotel: ${p.houseCost}</h5>
                                                    <h5 className="text-white">Mortgage Value: ${p.mortgageValue}</h5>
                                                    <button className="btn btn-danger" onClick={() => mortgagaProperty(p)}>Mortgage</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>  
    </div>
    );
}

export default Game;