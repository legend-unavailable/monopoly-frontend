import axios from 'axios';
import lobby from '../assets/cigarLounge.jpg';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSocket } from '../SocketContext';


const Lobby = () => {
    const [user, setUser] = useState();

    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [newRoom, setNewRoom] = useState({ roomType: '', roomName: '', roomPassword: ''});
    const [existsingRooms, setExistingRooms] = useState([]);

    const moveTo = useNavigate();
    const {socket, joinGame} = useSocket();
    const lol = useSocket();
    console.log(lol);
    

    //makes sure user is authenticated before proceeding
    useEffect(() => {
        const getSession = async() => {
            try {
                const res = await axios.get('http://localhost:3000/lobby', {withCredentials: true});
                if (res.data.authenticated) {
                    const id = res.data.user.userID;                    
                    setNewRoom({...newRoom, hostID: res.data.user.userID, hostUsername: res.data.user.username});
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
        const rooms = async() => {
            try {
                const res = await axios.get('http://localhost:3000/rooms', {withCredentials: true});
                setUser(res.data.user);
                setExistingRooms(res.data.rooms || []);
                return;
            } catch (err) {
                console.log(err);
                
            }
        }
        rooms();
    }, []);

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/lobby', newRoom, {withCredentials: true})
            if (res.status === 201) {
                joinGame({
                    gameID: res.data.game.id,
                    userID: newRoom.hostID,
                    username: newRoom.hostUsername
                })
                moveTo('/Queue', {state: {userInfo: {userID: newRoom.hostID, username: newRoom.hostUsername, gameID: res.data.game.id}}}, {replace: true});
            }
        } catch (err) {
            console.log(err); 
        }
    }

    //
    const handleSwitch = (num) => {
        if(num === 1)
            setShowJoinRoom(!showJoinRoom);
        else if(num === 2)
            setShowCreateRoom(!showCreateRoom);
        else if(num === 3){
            //setShowShop(!showShop);
        }
        setShowMenu(!showMenu);

    }

    //updates room creation info
    const updateRoomInfo = (e) => {
        e.preventDefault();
        setNewRoom({...newRoom, [e.target.name]: e.target.value});
        
    }

    //updates room type for room creation and adds radio button styling
    const getRoomType = (value) => {
        setNewRoom({...newRoom, roomType: value});
        if (value === 'public') 
            setShowPassword(false);
        else if(value === 'private')
            setShowPassword(true);
        else return;
        
    }

    const joinRoom = async(e, room) => {
        e.preventDefault();
        const res = await axios.patch('http://localhost:3000/lobby', {userID: newRoom.hostID, username: newRoom.hostUsername, roomID: room.id}, {withCredentials: true})
        if (res.status === 200) {
            joinGame({
                gameID: room.id,
                userID: newRoom.hostID,
                username: newRoom.hostUsername
            });
            moveTo('/Queue', {state: {userInfo: {userID: newRoom.hostID, username: newRoom.hostUsername, gameID: room.id}}});
        }
    }

    const menu = (
        <div className="container-fluid d-flex justify-content-evenly align-items-center  m-0" style={{ height: '65vh'
        }}>
            <div className="card border-success bg-success bg-opacity-25 h-50 w-25" onClick={() => handleSwitch(1)}>
                <div className="card-body text-success position-absolute start-50 top-50 translate-middle">
                    <h2 className="card-title text-center">Join a Room</h2>
                </div>
            </div>

            <div className="card border-primary bg-primary bg-opacity-25 h-50 w-25" onClick={() => handleSwitch(2)}>
                <div className="card-body text-primary position-absolute start-50 top-50 translate-middle">
                    <h2 className="card-title text-center">Create a Room</h2>
                </div>
            </div>

            <div className="card border-warning bg-warning bg-opacity-25 h-50 w-25">
                <div className="card-body text-warning position-absolute start-50 top-50 translate-middle">
                    <h2 className="card-title text-center">Shop</h2>
                </div>
            </div>
        </div>
    );

    const joinRoomForm = (
        <div className="container w-100 text-light" style={{height: '80%'}}>
            <div className="d-flex justify-content-center">
                <h2>Pick a room to join</h2>
            </div>

            <div className="container d-flex flex-xolumn justify-content-center" style={{height: '85%', width: '100%'}}>
                <div className="overflow-y-scroll conatiner border border-light border-2 rounded-3 w-75 text-light">
                    {existsingRooms.map((room, index) => (
                        <div className="container bg-dark m-2" onClick={(e) => joinRoom(e, room)} key={index}>
                            Room name: {room.name}
                            <div className="">Host name: {room.hostUsername}</div>
                            <div className="">Room type: {room.type}</div>
                        </div>
                    ))}
                    
                    
                </div>
            </div>
            <hr />
            <div className="pb-3 d-flex justify-content-center">
                <button className="btn btn-light" onClick={() => handleSwitch(1)}>Go Back</button>
            </div>
        </div>
        
    )

    const createRoomForm = (
        <form className="container d-flex flex-column text-light justify-content-center align-items-center w-50 border" onSubmit={handleSubmit}>
            <label className='form-label text-center fs-3'>
                Do you want to create a public or private room?
            </label>

            <div className="row align-items-center w-100 p-3">
                <input type="radio"  value='public' name='roomType' id="opt1" className='btn-check' autoComplete='off' checked={newRoom.roomType === 'public'} />
                <label className="btn btn-light col-5 p-2" for='opt1' onClick={() => getRoomType('public')}>Public</label>
                <p className="col-2"></p>
                <input type="radio" value='private' name='roomType' id="opt2" className='btn-check' autoComplete='off' checked={newRoom.roomType === 'private'} />
                <label className="btn btn-light col-5 p-2" for='opt2' onClick={() => {getRoomType('private')}}>Private</label>
            </div>

            <div className="row justify-content-center align-items-center w-100 d-flex pb-3">
                <label className='text-center fs-4 p-2'>
                        Enter a Room name
                </label>
                <input type="text" name='roomName' className='w-50' placeholder='e.g. Party Room' onChange={updateRoomInfo} required/>
            </div>
            
            {showPassword && (
                <div className="row justify-content-center align-items-center w-100 d-flex pb-4">
                    <label className='text-center fs-4 pb-2'>
                        Enter a password
                    </label>
                    <input type="text" name='roomPassword' className='w-50' placeholder='Password' onChange={updateRoomInfo} required/>
                </div>
            )}
            <div className="pb-3">
                <button className="btn btn-light" type='submit'>Create Room</button>
            </div>

            <hr className="border w-100 border-light" />

            <div className="pb-3">
                <button className="btn btn-light" onClick={() => handleSwitch(2)}>Go Back</button>
            </div>




        </form>
    )
    
    return(
        <div className="container-fluid p-0">
            <div className="position-relative" style={{height: '100vh'}}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    backgroundImage: `url(${lobby})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}/>
                <div className='position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50'/>

                <div className="position-relative pt-4 h-100" style={{zIndex: 2}}>
                    <div className="d-flex justify-content-center pb-5">
                        <h1 className="text-light">
                            Lobby
                        </h1>
                    </div>

                    {showMenu && menu}
                    {showCreateRoom && createRoomForm}
                    {showJoinRoom && joinRoomForm}
                    
                </div>
            </div>
        </div>
    )

}

export default Lobby;