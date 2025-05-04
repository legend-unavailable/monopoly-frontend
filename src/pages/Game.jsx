import { useEffect, useRef, useState } from "react";
import DiceRoller from './DiceRoller'
import { data, useLocation, useNavigate, useParams } from "react-router-dom";
import locations from '../locationImgs';
import axios from "axios";

import property from '../assets/cardFace/properties.png'
import fortune from '../assets/cardFace/fortune.png'

import scooter from '../assets/scooter.png';
import kart from '../assets/kart.png';
import boat from '../assets/boat.png';
import plane from '../assets/plane.png';
import { useSocket } from "../SocketContext";
import styled from "@emotion/styled";


const Game = () => {
    const {socket, sendChatMessage, buyProperty, switchPlayer, updateLocation, sendMoney, updateJail, cardUpdate, cardRemoval, fortuneDel, endGame} = useSocket();
    const moveTo = useNavigate();
    const [phase, setPhase] = useState('turnOrder');
    const [turnOrderRolls, setTurnOrderRolls] = useState({});
    const [turnQueue, setTurnQueue] = useState([]);
    const [currentTurnUserID, setCurrentTurnUserID] = useState(null);

    const [nextbgImage, setNextBgImage] = useState(null);
    const [currentbgImage, setCurrentBgImage] = useState(null);
    const [fadeIn, setFadeIn] = useState(false);
    const [location, setLocation] = useState('Go');

    const [propsOn, setPropsOn] = useState(false);
    const [inJail, setInJail] = useState(false);

    const [textMsg, setTextMsg] = useState('');

    //has moverLevel, balance, location, turnOrder, and mover
    const [dbplayer, setdbPlayers] = useState([]);
    //baseRent, color, hotelCost, houseCost, mortageValue, name, position, priceTag
    const [properties, setProperties] = useState([]);
    const [chances, setChances] = useState([]);
    const [lifestyles, setLifestyles] = useState([]);
    const [fortunes, setFortunes] = useState([]);

    const [landedProperty, setLandedProperty] = useState(null);
    const [popUp, setPopUp] = useState({type: 'start'});
    const [cardPop, setCardPop] = useState({type: 'start'});

    const [dropdown, setDropdown] = useState('All Players');
    const [chatMsgs, setChatMsgs] = useState([]);
    const [msg, setMsg] = useState('');
    const afterJailRef = useRef(null);
    const lastMSG = useRef(null);

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
                    setChances(res.data.chances);
                    setLifestyles(res.data.lifestyles);
                    setFortunes(res.data.fortunes);
                }
            } catch (err) {
                console.log('Err fetching players:', err);
            }
        }
        getPlayersInfo();
    }, [])

    //changes bg img
    useEffect(() => {
        const me = dbplayer.find(p => p.userID === userID);
        if (!me || me.location === undefined) 
            return;
        const property = (locations[me.location] || locations[0]);
        const bg = property.img;
        if (bg !== currentbgImage && currentTurnUserID === userID) {
            setFadeIn(true);
            setTimeout(() => {
                setCurrentBgImage(bg);
                setFadeIn(false);
            }, 1000);
        }
        setLocation(property);
        
    }, [dbplayer, userID, currentTurnUserID])
    
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
            setChatMsgs((prev) => [...prev, data]);
        }
        const handleTurnChange = (data) => {
            setPopUp({type: 'start'});
            setCardPop({type: 'start'});
            setCurrentTurnUserID(data);
            setLandedProperty(null); 
        }
        //socket purchase
        const handlePurchaseUpdate = (data) => {
            setdbPlayers(data.players)
            setProperties(prevProps => 
                prevProps.map(p => 
                    p.propertyID === data.propertyID ? {...p, ownerID: data.userID}: p
                )
            );
            if (data.userID === userID) {
                const p = properties.find(p => p.propertyID === data.propertyID);
                const turn = dbplayer.find(p => p.userID === userID);
                sendMsg('All Players', turn.username, `has bought ${p.name}`);
            }
        }
        const handleLocationUpdate = (data) => {
            const {updatedPlayers , type, player} = data;
            setdbPlayers(updatedPlayers);
            if (type !== null && player.userID === userID) {
                const msg = `${player.username}_${type}`;
                if (lastMSG.current !== msg) {
                    lastMSG.current = msg;
                    sendMsg('All Players', player.username, type);
                }
            }
        }
        const handleCardUpdate = (data) => {
            if (data.type === 'ml') {
                setLifestyles(data.cards);
            }
            else if (data.type === 'ch') {
                setChances(data.cards);
            }
            else {
                setFortunes(data.cards);
            }
        };
        const handleFortuneDelete = (data) => {
            setProperties(prev => 
                prev.map(p => 
                    p.propertyID === data.property ?
                    {...p, fortuneExists: false} : p
                )
            );
        }
        const handleEnd = (data) => {
            console.log('end game');
            
            setPopUp({type: 'game'});
            console.log('emd', popUp.type);
            
        }
        socket.on('propertyPurchaseUpdate', handlePurchaseUpdate)
        socket.on('chatMsg', handleChatMsg);
        socket.on('turnChanged', handleTurnChange);
        socket.on('updatedLoc', handleLocationUpdate);
        socket.on('setCard', handleCardUpdate);
        socket.on('deleteFortune', handleFortuneDelete);
        socket.on('gameEnd', handleEnd);
        return() => {
            socket.off('chatMsg', handleChatMsg);
            socket.off('propertyPurchaseUpdate', handlePurchaseUpdate);
            socket.off('turnChanged', handleTurnChange);
            socket.off('updatedLoc', handleLocationUpdate)
        };
    }, [socket, properties, currentTurnUserID, landedProperty]);

    //ADD: final stage
    const endTurn = () => {
        const currentIndex = turnQueue.indexOf(currentTurnUserID);
        const nextIndex = (currentIndex + 1) % turnQueue.length;
        const nextPlayerID = turnQueue[nextIndex]
        const me = dbplayer.find(p => p.userID === userID);
        if (me.balance >= 1000000) {
            endGame({gameID});
            console.log('ending');
            
            return;
        }
        if (me.inJail) {
            setInJail(true);   
        } 
        setCardPop({type: 'start'})
        switchPlayer({gameID, nextPlayerID});
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
    const sendMsg = (receiver, sender, msg) => {
        if (!msg.trim()) return;
        if (sender) {
            
        }
        const payload = {
            gameID,
            sender: sender,
            receiver: receiver === 'All Players' ? 'all': dropdown,
            msg: msg.trim()
        };      
        sendChatMessage(payload);
        setMsg('');
    }

    let ismyturn = phase === 'turnOrder'?
    !turnOrderRolls.hasOwnProperty(userID) :
    currentTurnUserID === userID;

    useEffect(() => {
        if (!inJail && afterJailRef.current) {
            afterJailRef.current();
            afterJailRef.current = null;
        }
    }, [inJail]);

    const handleTurn = (userID, diceTotal, diceRolls, l = null) => {
        const me = dbplayer.find(p => p.userID === userID);
        const currentPos = me.location || 0;
        let newPos = (currentPos + diceTotal) % locations.length;
        if (cardPop === 'space') {
            newPos = locations.indexOf(l);
            setCardPop({type: 'start'});
            diceTotal = newPos > currentPos ? newPos - currentPos : newPos + 32 - currentPos;
        }
        if (cardPop.type === 'dice') {
            let win = false;
            if (me.moverLevel === 1 && diceRolls.isDoubles) {
                win = true;
            }
            else if (me.moverLevel === 3 && diceTotal >= 8) {
                win = true;
            }
            else if (me.moverLevel === 5 && diceTotal >= 5) {
                win = true;
            }
            if (win) 
                cardUpdate({gameID, userID, val: cardPop.val, card: cardPop.card});
            cardRemoval({gameID, cards: chances, type: 'ch'});
            setCardPop({type: 'start'});
            setPopUp({type: 'final'});
            return;
        }
        let passedGo = (currentPos + diceTotal) >= locations.length;
        if (me.inJail) {
            if (diceRolls.isDoubles) {
                updateJail({me, gameID, state: 'free'})
                newPos = (8 + diceTotal) % locations.length;
                passedGo = false;
                afterJailRef.current = () => {
                    if (passedGo) {
                        setPopUp({
                            type: 'Go',
                            data: {
                                me,
                                newPos,
                                upgrade: (me.moverLevel < 5)
                            }
                        });
                        return;
                    }  
                    finishTurn(userID, newPos,)
                }
                setInJail(false);
                console.log('escaped with doubles', inJail);
            }
            else {
                console.log('jail turns', me.jailTurns, me.inJail)
                if (me.jailTurns < 2) {
                    setPopUp({type: 'final'});
                    updateJail({me, gameID, state: 'update'});
                    console.log('lastly');                    
                    return;
                }
                else if (me.jailTurns === 2) {
                    updateJail({me, gameID, state: 'free1'});
                    console.log('turn 3 in escape');
                    newPos = (8 + diceTotal) % locations.length;
                    passedGo = false;
                    afterJailRef.current = () => {
                        if (passedGo) {
                            setPopUp({
                                type: 'Go',
                                data: {
                                    me,
                                    newPos,
                                    upgrade: (me.moverLevel < 5)
                                }
                            });
                            return;
                        }  
                        finishTurn(userID, newPos,)
                    }
                    setInJail(false);
                }                
            }
        }
        //passed GO
        if (passedGo) {
            setPopUp({
                type: 'Go',
                data: {
                    me,
                    newPos,
                    upgrade: (me.moverLevel < 5)
                }
            });
            return;
        }  
        finishTurn(userID, newPos,)      
    }
    const finishTurn = (userID, newPos, newPlayer = null) => {
        if (newPos === 8 || newPos === 16 || newPos === 0) {
            setPopUp({type: 'final'})
        }
        else if (newPos === 24) {
            newPlayer = dbplayer.map(p => p.userID === userID ? {...p, inJail: true} : p);
            setdbPlayers(newPlayer);
            setPopUp(({type: 'final'}));
        }
        else if (newPos == 2 || newPos == 13 || newPos == 27) {
            //ADD: millionaire lifestyle
            setPopUp({type: 'final'})
            //setCardPop({type: 'ml'});
        }
        else if (newPos == 5 || newPos == 18 || newPos == 29) {
            //ADD: chance
            setPopUp({type: 'final'});
            //setCardPop({type: 'ch'});
        }
        //lands on property
        else {            
            const property = properties.find(p => p.position === newPos);
            //property is owned by someone else
            if (property.ownerID && property.ownerID !== userID) {
                const owner = dbplayer.find(p => p.userID === property.ownerID);
                const me = dbplayer.find(p => p.userID === userID);
                handlePayment(me, owner, property);
            }
            else if (property.ownerID === userID) {
                setLandedProperty(property);
                setPopUp({type: 'final'});
            }
            else {
                //has fortune card                
                if ((property.fortuneExists && fortunes.length > 0) && currentTurnUserID === userID && cardPop.type !== 'buy2' && cardPop.type !== 'buyTwo' && cardPop.type !== 'buy') {
                    fortuneDel({gameID, property});
                    setCardPop({type: 'fo'});
                    //ADD: collect fortune
                }
                setLandedProperty(property);
                setLocation(property);
                const player = dbplayer.find(p => p.userID === userID);
                setPopUp({type: 'prop', data: {userID, tooPoor: player.balance < property.priceTag}});
            }
        }
        const player = (newPlayer === null ? dbplayer : newPlayer);
        updateLocation({gameID, userID, newPos, player});
    };
    //player
    const handlePropertyPurchase = (userID, property, ans) => {        
        if (ans === 'yes') {
            buyProperty({gameID, userID, propertyID: property.id})
        }
        setLandedProperty(null);
        if (cardPop.type === 'buyTwo') {
            let possible = [];
            let nextPos = 0;
            properties.map(p => {
                if (p.color === property.color) {
                    possible.push(p);
                }
            });
            possible.map(p => {
                if (p.position !== property.position) {
                    if (p.position > property.position) {
                        nextPos = p.position;
                        return;
                    }
                    else {
                        nextPos = p.position;
                    }
                }
            });
            const dice = nextPos > property.position ? nextPos - property.position : nextPos + 32 - property.position;
            setCardPop({type: 'buy'});
            handleTurn(userID, dice, null);
            return;
        }
        else if (cardPop.type === 'buy2') {
            let nexPos = false;
            properties.map(p => {
                if (p.position > property.position && p.ownerID === null) {
                    nexPos = p.position;
                    return;
                }
            });
            console.log('step 1: nexpos', nexPos);
            
            if (nexPos === false) {
                properties.map(p => {
                    if (p.position !== property.position && p.ownerID === null) {
                        nexPos = p.position;
                    }
                    else if (p.position === property.position) {
                        return;
                    }
                });
            }
            console.log('step 2, nexpos', nexPos);
            
            let dice = 0;
            if (nexPos > property.position) {
                dice = nexPos - property.position;
                console.log('bigger', dice, (nexPos.position > property.position)); 
            }
            else {
                dice = nexPos + 32 - property.position;
                console.log('smaller', dice);   
            }
            console.log('step 3, dice', dice);
            
            setCardPop({type: 'buy'});
            handleTurn(userID, dice, null);            
            return;
        }        
        setPopUp({type: 'final'});
        setCardPop({type: 'start'})
        
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

    const handleEvents = (ans) => {
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
                    if (p.userID === popUp.data.payer.userID) {
                        return {...p, balance: p.balance - (popUp.data.amt)};
                    }
                    else if (p.userID === popUp.data.owner.userID) {
                        return {...p, balance: p.balance + (popUp.data.amt)};
                    }
                    else {
                        return p;
                    }
                })
            );
            sendMoney({payer: popUp.data.payer, owner: popUp.data.owner, amt: popUp.data.amt, gameID});
            setPopUp({type: "final"});
        }
        //salary and upgrading
        else if (popUp.type === 'Go') {
            let salary = 150000;
            let moverLvl = popUp.data.me.moverLevel;
            let msg = '';
            if (popUp.data.deduct != 0) {
                salary -= 50000;
                moverLvl += 2;
                msg = 'has upgraded their mover and ';
            }
            if (popUp.data.me.moverLevel > 1) {
                if (popUp.data.me.moverLevel > 3) {
                    salary += 50000;
                }
                salary += 50000;
            } 
            const {me, newPos} = popUp.data;
            const updated = dbplayer.map(p => 
                p.userID === me.userID ?
                {...p, balance: p.balance + salary, moverLevel: moverLvl} : p
            );
            setdbPlayers(updated);
            msg += `has collected their salary`;
            sendMsg('All Players', popUp.data.me.username, msg);
            setPopUp({type: 'start'});
            finishTurn(me.userID, newPos, updated);
        }
        else if (popUp.type === 'broke') {
            setPropsOn(true);
        }
        else if (inJail === true) {
            const me = dbplayer.find(p => p.userID === userID);
            if (ans === 'bribe') {
                updateJail({me, gameID, state: 'bribe'});
                setInJail(false);
                console.log('escaped with doubles', inJail);
                sendMsg('All Players', me.username, 'has paid the bail');
            }
            else {
                setInJail(false);
            }
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
        setMsg('has mortgaged ', prop.name);
        sendMsg('All Players', popUp.data.payer.username, msg);
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

    const handleCards = (card) => {
        const me = dbplayer.find(p => p.userID === userID);
        if (cardPop.type === 'ml') {
            if (card.actionType === 'collect') {
                if (card.actionValue === 'upgrade') {
                    cardUpdate({gameID, userID, val: 0, card});
                    cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                    setCardPop({type: 'start'});
                }
                else {
                    let money = 0;
                    if (me.moverLevel === 1) 
                        money = card.valueByLevels[0];
                    else if (me.moverLevel === 3)
                        money = card.valueByLevels[1];
                    else money = card.valueByLevels[2]; 
                    cardUpdate({gameID, userID, val: money, card});
                    cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                    setCardPop({type: 'start'});                  
                }
            }
            else if (card.actionType === 'move') {
                cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                setCardPop({type: 'space'});
            }
            else if (card.actionType === 'moveTo') {
                if (card.actionValue === 'Go') {
                    const me = dbplayer.find(p => p.userID === userID);
                    cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                    handleTurn(userID, 32 - me.location, null);
                }
                else {
                    let money = 0;
                    if (me.moverLevel === 1) 
                        money = card.valueByLevels[0];
                    else if (me.moverLevel === 3)
                        money = card.valueByLevels[1];
                    else money = card.valueByLevels[2];
                    cardUpdate({gameID, userID, val: money, card});
                    cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                    setCardPop({type: 'start'});
                    handleTurn(userID, 5, null);
                }
            }
            else if (card.actionType === 'getoutofjail') {
                cardUpdate({gameID, userID, val: null, card});
                cardRemoval({gameID, cards: lifestyles, type: cardPop.type});
                setCardPop({type: 'start'});
            }
        }
        else if (cardPop.type === 'ch') {
            if (card.actionType === 'pay') {
                if (card.actionValue === 'giveOne') {
                    const money = card.valueByLevels[0];
                    setCardPop({type: 'pick', data: {money, card}})
                }
                else if (card.actionValue === 'giveAll') {
                    let money = 0;
                    if (me.moverLevel === 1) 
                        money = card.valueByLevels[0];
                    else if (me.moverLevel === 3)
                        money = card.valueByLevels[1];
                    else money = card.valueByLevels[2];
                    cardUpdate({gameID, userID, val: money, card});
                    cardRemoval({gameID, cards: chances, type: cardPop.type});
                    setCardPop({type: 'start'});
                }
            }
            else if (card.actionType === 'collect') {
                cardUpdate({gameID, userID, val: 0, card});
                cardRemoval({gameID, cards: chances, type: cardPop.type});
                setCardPop({type: 'start'});
            }
            else if (card.actionType === 'roll') {
                setPopUp({type: 'start'});
                setCardPop({type: 'dice', val: card.valueByLevels[0], card});
            }
            else if (card.actionType === 'downgrade') {
                const me = dbplayer.find(p => p.userID === userID);
                if (me.moverLevel !== 1)
                    cardUpdate({gameID, userID, val: 0, card});
                cardRemoval({gameID, cards: chances, type: cardPop.type});
                setCardPop({type: 'start'});
            }
        }
        else if (cardPop.type === 'fo') {
            if (card.fortuneTitle === 'Feeling Generous!') {
                if (card.actionValue === 'giveOne') {
                    setCardPop({type: 'pick', data: {money: card.valueByLevels[0], card}});
                    console.log('in give one');
                    
                }
                else {
                    cardUpdate({gameID, userID, val: card.valueByLevels[0], card: {actionType: card.actionType, actionValue: 'giveAll'}});
                    cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                    setCardPop({type: 'buy'});
                    console.log('should not be here');
                    
                }
            }
            else if (card.fortuneTitle === 'Luxury Limo Ride') {
                const me = dbplayer.find(p => p.userID === userID);
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'start'});
                handleTurn(userID, 32 - me.location, null);
            }
            else if (card.fortuneTitle === 'Lawsuit!') {
                const money = card.valueByLevels[0];
                setCardPop({type: 'pick', data: {money, card}})
            }
            else if (card.fortuneTitle === 'Wedding Gift!') {
                cardUpdate({gameID, userID, val: card.valueByLevels[0], card: {actionType: card.actionType, actionValue: 'takeAll', type: 'fortune'}});
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'buy'});
            }
            else if (card.fortuneTitle === 'Get Set!') {
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'buyTwo'});
            }
            else if (card.fortuneTitle === 'Zoom Ahead!' || card.fortuneTitle === 'Take a trip!') {
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type : 'buy2'});
            }
            else if (card.fortuneTitle === 'Shares Skyrocket!') {
                cardUpdate({gameID, userID, val: card.valueByLevels[0], card: {actionType: card.actionType, actionValue: 'non'}});
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'buy'});
            }
            else if (card.fortuneTitle === 'No Loitering') {
                cardUpdate({gameID, userID, val: card.valueByLevels[0], card});
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'start'});
            }
            else if (card.fortuneTitle === 'Free House!' || card.fortuneTitle === 'Forced Deal!'|| card.fortuneTitle === 'Sly Deal!' || card.fortuneTitle === 'Just Say No!') {

                const players = dbplayer.map(p => 
                    p.userID === userID ? 
                    {...p, fortunes: [...p.fortunes, card]} : p
                )
                console.log('pla', players, 'card', card);
                
                updateLocation({gameID, userID, newPos: me.location, player: players});
                cardRemoval({gameID, cards: fortunes, type: cardPop.type});
                setCardPop({type: 'start'});
            }
            return;
        }
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
        opacity: 1;
        transition: opacity 1s ease-in-out;
        z-index: 0;
    }

    .background-layer.fade-out {
        opacity: 0;
    }
            `}
        </style>
        <div className="position-relative" style={{height: '100vh'}}>
            <div className="background-wrapper">
                {/*{currentbgImage && (
                    <div className={`background-layer ${!fadeIn ? 'show': 'hide'}`}
                    style={{backgroundImage: `url(${currentbgImage})`}}></div>
                )}
                {nextbgImage && nextbgImage !== currentbgImage && (
                    <div className={`background-layer ${fadeIn ? 'show': 'hide'}`}
                    style={{backgroundImage: `url(${nextbgImage})`}}></div>
                )}*/}
                <div className={`background-layer ${fadeIn ? 'fade-out': ''}`}
                style={{backgroundImage: `url(${currentbgImage})`}}></div>
            </div>
            
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
            <div className="position-relative p-4 h-100" style={{zIndex: 2}}>
                <div className="d-flex h-100" style={{zIndex: 1}}>
                    <div className="container h-100">
                        <div className="d-flex flex-column justify-content-end h-100 m5-auto text-white">
                            <div className=" w-25 m-1" style={{height: '15%'}}>
                                <img src={fortune} alt="Fortunes" className="img-fluid h-100 w-auto" onClick={() => {setPopUp({type: 'fortunes'}); console.log(dbplayer.find(p => p.userID === userID).fortunes);
                                }}/>
                            </div>
                            <div className=" w-50 m-1" style={{height: '35%'}}>
                                <img src={property} alt="Properties" className="img-fluid h-100 w-auto" onClick={() => setPopUp({type: 'properties'})}/>
                            </div>
                        </div>
                    </div>
                    <div className="container  h-100">
                        <div className="container h-100 d-flex flex-column justify-content-between">
                            <h1 className="text-white text-center m-3">{location?.name? location.name: ''}</h1>
                            <div className="container m-3">
                                <h3 className="text-white">
                                    {phase === 'playing'?ismyturn?"It's your turn":`Waiting for ${players.find(p => p.userID === currentTurnUserID)?.username || '...'}`:'Roll to determine turn order'}
                                </h3>
                            </div>
                            <div className="container  h-25 w-50 mt-3 mb-3">
                                <img src={moverImgs[mover]} alt={mover} className="img-fluid h-50 w-100" />
                            </div>
                        {landedProperty == null && popUp.type == 'start' && !inJail && (
                            <div className="container p-3 mb-3 text-center">
                                <h2 className="text-white ">
                                    {phase === 'turnOrder'?'Roll the dice to determine turn order':''}
                                </h2>
                                <DiceRoller 
                                gameID={gameID}
                                userInfo={{userID,}}
                                isMyTurn={ismyturn}
                                phase={phase}
                                turnOrderRolls={turnOrderRolls}
                                setTurnOrderRolls={setTurnOrderRolls}
                                updatePlayerLocation={handleTurn}
                                sendMsg={sendMsg}
                                />
                                
                                {turnQueue.length > 0 && (
                                    <div className=" text-white">
                                        <h5>Turn Order</h5>
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
                            </div>
                        )}
                            {popUp.type === 'prop' && ismyturn && (
                                <div className="container p-3 text-white bg-dark rounded shadow text-center">
                                    <h3>Do you want to buy this property for ${landedProperty.priceTag}</h3>
                                    <button 
                                    className="btn btn-success me-2" 
                                    onClick={() => handlePropertyPurchase(popUp.data.userID, landedProperty, 'yes')}
                                    disabled={popUp.data.tooPoor}
                                    >
                                        Buy
                                    </button>
                                    <button className="btn btn-danger me-2"
                                    onClick={() => handlePropertyPurchase(popUp.data.userID, landedProperty, 'no')}
                                    disabled={cardPop.type === 'buy' || cardPop.type === 'buyTwo' || cardPop.type === 'buy2'}
                                    >
                                        Skip
                                    </button>

                                </div>
                            )} 
                            {popUp.type === 'Go' && currentTurnUserID === userID && (
                                <div className="container p-3 text-white bg-dark rounded shadow text-center">
                                    {popUp.data.upgrade && (
                                        <div>
                                            <h5>Do you want to upgrade your mover? $50,000 will be taken out of salary if yes.</h5>
                                            <button className="btn btn-success m-2" onClick={() => setPopUp({type: 'Go', data: {me: popUp.data.me, upgrade: false, deduct: 50000, newPos: popUp.data.newPos}})}>
                                                Upgrade
                                            </button>
                                            <button className="btn btn-danger m-2" onClick={() => setPopUp({type: 'Go', data: {me: popUp.data.me, upgrade: false, deduct: 0, newPos: popUp.data.newPos}})}>
                                                Skip
                                            </button>
                                        </div>
                                    )}
                                    <button className="btn btn-success m-2"
                                    disabled={popUp.data.upgrade}
                                    onClick={() => handleEvents()}
                                    >
                                        Collect Salary
                                    </button>

                                </div>
                            )}
                            {popUp.type === 'payment' && currentTurnUserID === userID && (
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
                            {inJail && popUp.type === 'start' && currentTurnUserID === userID && (
                                <div className="container border border-white bg-dark">
                                <h3 className="text-white">
                                    You are in jail. Do you want to bribe the gaurds with $50,000 or try to escape. 
                                </h3>
                                <div className="container">
                                    <button className="btn btn-secondary" onClick={() => handleEvents('escape')}>
                                        Escape
                                    </button>
                                    <button className="btn btn-danger"
                                    onClick={() => handleEvents('bribe')}
                                    >
                                        Bribe
                                    </button>
                                </div>
                            </div>
                            )}
                            {popUp.type === 'final'&& currentTurnUserID === userID && (
                                <div className="container bg-dark text-center">
                                <h3 className="text-white">
                                    When you are done, click the button to end your turn. 
                                </h3>
                                <div className="container mb-2">
                                    <button className="btn btn-secondary" onClick={() => endTurn()}>
                                        End Turn
                                    </button>
                                    
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                    <div className="container d-flex flex-column justify-content-between h-100">
                        {dbplayer.map(player => (
                            <div className="d-flex bg-dark bg-opacity-75 p-2 rounded text-white" key={player.userID}>
                                <span>{player.username}: ${player.balance}</span>
                            </div>
                        ))}
                        <div className="bg-light mt-auto h-50 d-flex flex-column">
                            <div className="border border-color-dark h-100 overflow-y-scroll">
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
                                    <input type="text" className="form-control" id='msg' value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg(dropdown, username, msg)}/>
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
                {cardPop.type === 'ml' && (
                    <div className="container h-100">
                        <div className="container border border-white bg-dark">
                        {lifestyles[0] !== undefined || lifestyles[0] !== null && (
                            <div className="container">
                                <h2 className="text-white">Millionaire Lifestyle</h2>
                                <hr className="border border-white" />
                                <h3 className="text-white">{lifestyles[0].description}</h3>
                                <button className="btn btn-secondary" onClick={() => handleCards(lifestyles[0])}>
                                    Accept
                                </button>
                            </div>

                        )}
                        {cardPop.type === 'space' && (
                            <div className="container">
                                {locations.map( l => 
                                    <div className="container border border-white" onClick={() => {handleTurn(userID, 0, null, l); setCardPop({type: 'start'})}}>
                                        <h3 className="text-white">
                                            {l.name}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    </div>
                )}
                {popUp.type === 'fortunes' && (
                    <div className="container h-25 w-100 position-absolute start-50 top-50 translate-middle" style={{zIndex: 99}}>
                    <style>
                        {`
                            .fortune-scroll::-webkit-scrollbar {
                                width: 8px;
                            }
                            .fortune-scroll::-webkit-scrollbar-thumb {
                                background-color: #555;
                                border-radius: 4px;
                            }
                            .fortune-scroll::-webkit-scrollbar-track {
                                background-color: #222;
                            }
                        `}
                    </style>
                    <div className="container border border-white bg-dark overflow-y-scroll fortune-scroll w-100" style={{maxHeight: '100%', overflowX: 'hidden'}}>
                    <div className="d-flex flex-wrap gap-3">
                        {(() => {
                            const player = dbplayer.find(p => p.userID === userID);
                            if (!player || !player.fortunes) return <h1 className="text-white">No Fortunes Owned</h1>;
                            return player.fortunes.map((f, index) => (
                                    <div key={index} className=" border border-light text-white my-2 p-3 w-25">
                                    <h5>{f.fortuneTitle}</h5>
                                    <hr className="border border-white" />
                                    <p>{f.description}</p>
                                    <button className="btn btn-secondary">
                                        Use
                                    </button>
                                    </div>
                                
                            ));
                        })()}
                    </div>
                    <div className='text-center mt-3'>
                        <button className="btn btn-secondary mt-3" onClick={() => setPopUp({type: 'final'})}>
                            Go Back
                        </button>
                    </div>
                    </div>
                    </div>
                )}
                {popUp.type === 'properties' && (
                    <div>
                        <style>
                        {`
                            .fortune-scroll::-webkit-scrollbar {
                                width: 8px;
                            }
                            .fortune-scroll::-webkit-scrollbar-thumb {
                                background-color: #555;
                                border-radius: 4px;
                            }
                            .fortune-scroll::-webkit-scrollbar-track {
                                background-color: #222;
                            }
                        `}
                    </style>
                    <div className="container h-50 w-100 position-absolute start-50 top-50 translate-middle overflow-y-scroll p-0 bg-dark fortune-scroll text-center" style={{zIndex: 99,}}>
                        <div className="container m-0 d-flex flex-row">
                        {properties.map(p => 
                            p.ownerID === userID ? 
                            (
                                <div className={`container text-center rounded h-100 w-100 m-2`} style={{backgroundColor: p.color}}>
                                    <h3 className={` text-white`}>
                                        {p.name}
                                        <hr className="border border-white" />
                                    </h3>
                                    {p.isMortaged && (
                                        <h2 className="border border-white text-white">
                                            This property is already mortgaged
                                        </h2>
                                    )}
                                    {!p.isMortaged && (
                                        <div className="container border border-white">
                                            <h5 className="text-white">Rent: ${p.baseRent}</h5>
                                            {p.rentWithHouses.map((rents, index) => (
                                                <h5 className="text-white">Rent with {index + 1} house/s: ${rents}</h5>
                                            ))}
                                            <h5 className="text-white">Rent with a hotel: ${p.rentWithHotel}</h5>
                                            <h5 className="text-white">Cost of houses and hotel: ${p.houseCost}</h5>
                                            <h5 className="text-white">Mortgage Value: ${p.mortgageValue}</h5>
                                        </div>
                                    )}
                                    <div>
                                        <button className="btn btn-secondary my-2">
                                            Buy a House
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div></div>
                            )
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={() => setPopUp({type: 'final'})}>
                            Go Back
                        </button>
                    </div>
                    </div>
                )}
                {cardPop.type === 'ch' && (
                    <div className="container h-100">
                        <div className="container border border-white bg-dark">
                        {chances[0] !== undefined || chances[0] !== null && (
                            <div className="container">
                                <h2 className="text-white">Chance</h2>
                                <hr className="border border-white" />
                                <h3 className="text-white">{chances[0].description}</h3>
                                <button className="btn btn-secondary" onClick={() => handleCards(chances[0])}>
                                    Accept
                                </button>
                            </div>

                        )}
                        </div>
                    </div>
                )}
                {cardPop.type === 'pick' && (
                    <div className="container h-100 position-absolute start-50 w-75 h-75 translate-middle" style={{zIndex: 99}}>
                        {dbplayer.map(p => p.userID !== userID ? (
                            <div className="container border border-white bg-dark" onClick={() => {cardUpdate({gameID, userID, val: cardPop.data.money, card: {actionType: cardPop.data.card.actionType, actionValue: 'takeOne'}, otherPlayer: p.userID}); cardRemoval({gameID, cards: (cardPop.data.card.type === 'fortune'? fortunes : chances), type: (cardPop.data.card.type === 'fortune'? 'fo' : 'ch')}); setCardPop({type: 'buy'})}}>
                                <h2 className="text-white">{p.username}</h2>
                            </div>
                        ) : (
                            <div className=""></div>
                        ))}
                    </div>
                )}
                {cardPop.type === 'fo' && currentTurnUserID === userID && (
                    <div className="container top-50 position-absolute start-50 w-75 translate-middle" style={{zIndex: 99}}>
                        <div className="container h-100 border border-white bg-dark">
                        {fortunes.length > 0 && (
                            <div className="container text-center">
                                <h1 className="text-white">Fortune</h1>
                                <hr className="border border-white" />
                                <h2 className="text-white">{fortunes[0].fortuneTitle}</h2>
                                <h3 className="text-white">{fortunes[0].description}</h3>
                                <button className="btn btn-secondary mb-2" onClick={() => handleCards(fortunes[0])}>
                                    Accept
                                </button>
                            </div>

                        )}
                        </div>
                    </div>
                )}
                {popUp.type === 'game' && (
                    <div className="container h-50 position-absolute start-50 top-50 w-50 translate-middle" style={{zIndex: 99}}>
                        <div className="container   h-100">
                            {currentTurnUserID === userID ?
                                (
                                    <div className="container rounded text-white text-center bg-success h-100 d-flex flex-column justify-content-evenly ">
                                        <h1>
                                            Congratulations!!
                                        </h1>
                                        <h2>
                                            You have become a millionaire!
                                        </h2>
                                        <hr className="border border-white"/>
                                        <button className=" btn btn-secondary text-white mb-3 w-25 align-self-center" onClick={() => moveTo('/Lobby')}>
                                            End Game
                                        </button>
                                    </div>
                                ) : 
                                (
                                    <div className="container rounded text-white text-center bg-danger h-100 d-flex flex-column justify-content-evenly ">
                                        <h1>
                                            {dbplayer.find(p => p.userID === currentTurnUserID).username} has become a millionaire!
                                        </h1>
                                        <hr className="border border-white" />
                                        <button className="btn btn-secondary mb-3 w-25 align-self-center"
                                        onClick={() => moveTo('/Lobby')}>
                                            End Game
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>  
    </div>
    );
}

export default Game;